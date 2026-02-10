
function deriveMessages(allMessages, activeVersions) {
    if (allMessages.length === 0) return [];

    const result = [];
    const messagesByParent = new Map();

    allMessages.forEach(msg => {
        const parentId = msg.parentMessageId || 'root';
        if (!messagesByParent.has(parentId)) {
            messagesByParent.set(parentId, []);
        }
        messagesByParent.get(parentId).push(msg);
    });

    let currentParentId = 'root';
    const visited = new Set();

    while (true) {
        if (visited.has(currentParentId)) break;
        visited.add(currentParentId);

        const children = messagesByParent.get(currentParentId);

        if (!children || children.length === 0) {
            const currentMessage = result.find(m => m.id === currentParentId);
            let cousinFound = false;

            if (currentMessage || currentParentId === 'root') {
                const grandParentId = currentMessage ? (currentMessage.parentMessageId || 'root') : 'root';
                const siblings = messagesByParent.get(grandParentId) || [];

                for (let i = siblings.length - 1; i >= 0; i--) {
                    const sibling = siblings[i];
                    if (sibling.id === currentParentId) continue;

                    const cousins = messagesByParent.get(sibling.id);
                    if (cousins && cousins.length > 0) {
                        const selection = activeVersions[sibling.id];
                        let chosenCousin = selection ? cousins.find(c => c.id === selection) : null;
                        if (!chosenCousin) chosenCousin = cousins[cousins.length - 1];

                        result.push(chosenCousin);
                        currentParentId = chosenCousin.id;
                        cousinFound = true;
                        break;
                    }
                }
            }

            if (cousinFound) {
                continue;
            } else {
                break;
            }
        }

        let selectedId = activeVersions[currentParentId];
        let selectedChild = selectedId ? children.find(m => m.id === selectedId) : null;

        if (!selectedChild) {
            selectedChild = children[children.length - 1];
        }

        if (selectedChild) {
            result.push(selectedChild);
            currentParentId = selectedChild.id;
        } else {
            break;
        }
    }

    return result;
}

function runTest(name, allMessages, activeVersions) {
    console.log(`--- Test: ${name} ---`);
    const result = deriveMessages(allMessages, activeVersions);
    console.log('Result:', result.map(m => `${m.role}(${m.id}) -> parent:${m.parentMessageId}`).join('\n'));
    return result;
}

runTest('Cousin Fallback Scenario', [
    { id: 'A', role: 'user', content: 'Hi', timestamp: new Date(), parentMessageId: null },
    { id: 'B1', role: 'assistant', content: 'Response 1', timestamp: new Date(), parentMessageId: 'A' },
    { id: 'C', role: 'user', content: 'Follow up', timestamp: new Date(), parentMessageId: 'B1' },
    { id: 'B2', role: 'assistant', content: 'Response 2 (Regenerated)', timestamp: new Date(), parentMessageId: 'A' }
], { 'A': 'B2' });

runTest('Root Message Fallback Scenario', [
    { id: 'A1', role: 'user', content: 'Hi v1', timestamp: new Date(), parentMessageId: null },
    { id: 'A2', role: 'user', content: 'Hi v2', timestamp: new Date(), parentMessageId: null },
    { id: 'B', role: 'assistant', content: 'Response to v2', timestamp: new Date(), parentMessageId: 'A2' }
], { 'root': 'A1' });

runTest('Deep Nesting Fallback', [
    { id: 'U1_v1', role: 'user', content: 'U1 v1', parentMessageId: null },
    { id: 'U1_v2', role: 'user', content: 'U1 v2', parentMessageId: null },
    { id: 'A1_v1', role: 'assistant', content: 'A1 v1', parentMessageId: 'U1_v2' },
    { id: 'A1_v2', role: 'assistant', content: 'A1 v2', parentMessageId: 'U1_v2' },
    { id: 'U2', role: 'user', content: 'U2', parentMessageId: 'A1_v2' },
    { id: 'A2', role: 'assistant', content: 'A2', parentMessageId: 'U2' }
], { 'root': 'U1_v1' });

runTest('Deeper Split Fallback', [
    { id: 'U1', role: 'user', content: 'U1', parentMessageId: null },
    { id: 'A1_v1', role: 'assistant', content: 'A1 v1', parentMessageId: 'U1' },
    { id: 'A1_v2', role: 'assistant', content: 'A1 v2', parentMessageId: 'U1' },
    { id: 'U2_v1', role: 'user', content: 'U2 v1', parentMessageId: 'A1_v1' },
    { id: 'U2_v2', role: 'user', content: 'U2 v2', parentMessageId: 'A1_v1' },
    { id: 'A2', role: 'assistant', content: 'A2', parentMessageId: 'U2_v2' }
], { 'root': 'U1', 'U1': 'A1_v1', 'A1_v1': 'U2_v1' });
// If we select U2_v1, it has no children. It should fallback to U2_v2 branch?
// Current logic: siblings of U2_v1 are [U2_v1, U2_v2]. U2_v2 has child A2.
// So U2_v1 -> A2 should happen.
