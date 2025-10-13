import ChatRoomsList from "./_components/ChatRoomsList";


export default function ChatPage() {
  return (
    <div className="max-w-lg mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4">Your Chats</h2>
      <ChatRoomsList />
    </div>
  );
}
