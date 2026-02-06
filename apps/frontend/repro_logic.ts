
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
  while (true) {
    const versions = messagesByParent.get(currentParentId);
    if (!versions || versions.length === 0) break;

    // Select active version: either from state or the last one (most recent)
    let activeId = activeVersions[currentParentId];
    let activeMsg = activeId ? versions.find(m => m.id === activeId) : null;
    
    if (!activeMsg) {
      // Default to latest version if not set or not found
      activeMsg = versions[versions.length - 1];
    }

    result.push(activeMsg);
    currentParentId = activeMsg.id;
  }

  return result;
}

// Test Helper
function runTest(name: string, allMessages: Message[], activeVersions: Record<string, string>) {
  console.log(`--- Test: ${name} ---`);
  const result = deriveMessages(allMessages, activeVersions);
  console.log('Result:', result.map(m => `${m.role}(${m.id}) -> parent:${m.parentMessageId}`).join('\n'));
  return result;
}

// Scenarios

// 1. Basic linear chat
runTest('Linear Chat A -> B', [
  { id: 'A', role: 'user', content: 'Hi', timestamp: new Date(), parentMessageId: null },
  { id: 'B', role: 'assistant', content: 'Hello', timestamp: new Date(), parentMessageId: 'A' }
], {});

// 2. Optimistic send of C
runTest('Add Optimistic C', [
  { id: 'A', role: 'user', content: 'Hi', timestamp: new Date(), parentMessageId: null },
  { id: 'B', role: 'assistant', content: 'Hello', timestamp: new Date(), parentMessageId: 'A' },
  { id: 'tempC', role: 'user', content: 'How are you', timestamp: new Date(), parentMessageId: 'B' }
], { 'B': 'tempC' });


// 3. Stale Active Version ID (ActiveID not in valid messages)
// This simulates: We had activeVersions[A] = 'tempB'. 
// But 'tempB' is gone, replaced by 'RealB'.
// But activeVersions still points to 'tempB'.
runTest('Stale Active Version', [
  { id: 'A', role: 'user', content: 'Hi', timestamp: new Date(), parentMessageId: null },
  { id: 'RealB', role: 'assistant', content: 'Hello', timestamp: new Date(), parentMessageId: 'A' }
], { 'A': 'tempB' }); 
// Expected: Should fallback to RealB.


// 4. Missing Parent Message?
// If B is missing.
runTest('Missing Middle Message', [
  { id: 'A', role: 'user', content: 'Hi', timestamp: new Date(), parentMessageId: null },
  { id: 'tempC', role: 'user', content: 'How are you', timestamp: new Date(), parentMessageId: 'B' } // Parent B is missing!
], { 'A': 'tempB', 'B': 'tempC' });
// Expected: Should stop at A.


// 5. User claims "updates existing message".
// This means C replaces B.
// This happens if C's parent is A.
runTest('Sibling Creation (Bug Simulation)', [
    { id: 'A', role: 'user', content: 'Hi', timestamp: new Date(), parentMessageId: null },
    { id: 'B', role: 'assistant', content: 'Hello', timestamp: new Date(), parentMessageId: 'A' },
    { id: 'C', role: 'user', content: 'New Message', timestamp: new Date(), parentMessageId: 'A' } // Parent is A!
  ], { 'A': 'C' });
// Expected: A -> C. (B is hidden).


