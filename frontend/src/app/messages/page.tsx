
"use client";

import { useState } from "react";

const conversations = [
  {
    id: 1,
    name: "AstraZen",
    message: "Want to compare maps?",
  },
  {
    id: 2,
    name: "NovaVex",
    message: "Scrim confirmed.",
  },
  {
    id: 3,
    name: "Coach Lin",
    message: "Are you available this weekend?",
  },
];

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState(1);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedId
  );

  return (
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Messages
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedId(conversation.id)}
              className={`w-full rounded-lg p-4 text-left ${
                selectedId === conversation.id
                  ? "bg-purple-800"
                  : "bg-gray-800"
              }`}
            >
              <h2 className="font-bold">{conversation.name}</h2>
              <p className="text-gray-300">
                {conversation.message}
              </p>
            </button>
          ))}
        </div>

        <div className="rounded-lg bg-gray-900 p-6 md:col-span-2">
          <h2 className="mb-4 text-xl font-bold">
            {selectedConversation?.name}
          </h2>

          <p className="rounded-lg bg-gray-800 p-4">
            {selectedConversation?.message}
          </p>
        </div>
      </div>
    </main>
  );
}
