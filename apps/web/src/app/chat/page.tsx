import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";

export default function ChatRootPage() {
  return (
    <Card padded>
      <EmptyState
        title="Pick a conversation"
        description="Select a conversation on the left to start chatting. Mock peers reply automatically."
      />
    </Card>
  );
}
