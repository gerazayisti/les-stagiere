
import { Card } from "@/components/ui/card";
import { CVManager } from "@/components/profile/CVManager";
import { InteractiveCV } from "@/components/profile/InteractiveCV";

interface CVTabProps {
  isOwner: boolean;
  cvUrl: string;
  onUpload: (file: File) => Promise<void>;
}

export function CVTab({ isOwner, cvUrl, onUpload }: CVTabProps) {
  return (
    <Card className="p-6">
      {isOwner ? (
        <CVManager onUpload={onUpload} cvUrl={cvUrl} />
      ) : (
        <InteractiveCV cvUrl={cvUrl} />
      )}
    </Card>
  );
}
