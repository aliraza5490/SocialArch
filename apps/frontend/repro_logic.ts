
// Mock types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  parentMessageId?: string | null;
  chatId?: string;
}

// Logic copied/adapted from page.tsx
function deriveMessages(
  allMessages: Message[],
  activeVersions: Record<string, string>
): Message[] {
  if (allMessages.length === 0) return [];

  const result: Message[] = [];
  const messagesByParent = new Map<string, Message[]>();
  
  allMessages.forEach(msg => {
    const parentId = msg.parentMessageId || 'root';
    if (!messagesByParent.has(parentId)) {
      messagesByParent.set(parentId, []);
    }
    messagesByParent.get(parentId)!.push(msg);
  });

  // Traverse from root following active versions
  let currentParentId = 'root';
  let visited = new Set<string>();

  while (true) {
    if (visited.has(currentParentId)) break;
    visited.add(currentParentId);

    const children = messagesByParent.get(currentParentId) || [];
    
    if (children.length === 0) {
        // Fallback logic
        const currentMessage = result.find(m => m.id === currentParentId);
        let cousinFound = false;

        if (currentMessage || currentParentId === "root") {
            const grandParentId = currentMessage?.parentMessageId || "root";
            const siblings = messagesByParent.get(grandParentId) || [];
            
            for (let i = siblings.length - 1; i >= 0; i--) {
                const sibling = siblings[i];
                if (sibling.id === currentParentId) continue; 

                const cousins = messagesByParent.get(sibling.id);
                if (cousins && cousins.length > 0) {
                    const activeId = activeVersions[sibling.id];
                    let chosenCousin = activeId ? cousins.find(c => c.id === activeId) : cousins[cousins.length - 1];
                    
                    result.push(chosenCousin!);
                    currentParentId = chosenCousin!.id;
                    cousinFound = true;
                    break;
                }
            }
        }
        
        if (cousinFound) continue;
        break;
    }

    // Select active version: either from state or the last one (most recent)
    let activeId = activeVersions[currentParentId];
    let activeMsg = activeId ? children.find(m => m.id === activeId) : children[children.length - 1];

    if (activeMsg) {
      result.push(activeMsg);
      currentParentId = activeMsg.id;
    } else {
      break;
    }
  }

  return result;
}

// Test Helper
function runTest(name: string, allMessages: Message[], activeVersions: Record<string, string>) {
  console.log(`--- Test: ${name} ---`);
  const result = deriveMessages(allMessages, activeVersions);
  console.log('Result:', result.map(m => `${m.role}(${m.id})`).join(' -> '));
  return result;
}

// Scenarios
// ... (previous scenarios omitted for brevity in thought, but I will keep them in file)

runTest('Changing First Message Version', [
    { id: 'U1_v1', role: 'user', content: 'Prompt 1', timestamp: new Date(), parentMessageId: null },
    { id: 'A1', role: 'assistant', content: 'Response to P1', timestamp: new Date(), parentMessageId: 'U1_v1' },
    { id: 'U1_v2', role: 'user', content: 'Prompt 2 (First Message V2)', timestamp: new Date(), parentMessageId: null }
], { 'root': 'U1_v2' });
// Expected: U1_v2 -> A1 (via fallback)



