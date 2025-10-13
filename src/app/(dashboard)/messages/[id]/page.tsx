// app/chats/[id]/page.tsx

import ChatWindow from "../_components/ChatWindow";


export default function ChatPage({ params }: { params: { id: string } }) {
  console.log("Route params:", params); // Debug the params
  return (
    <ChatWindow receiverId={params.id} employeeid="EMP-009" />
  );
}