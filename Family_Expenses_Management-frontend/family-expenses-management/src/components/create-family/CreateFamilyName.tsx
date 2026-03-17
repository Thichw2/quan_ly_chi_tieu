import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
  name: string;
  setName: (name: string) => void;
}

export default function CreateFamilyName({ name, setName }: Props) {

  return (
    <div className="space-y-4">
      <Label htmlFor="family-name">Family Name</Label>
      <Input
        id="family-name"
        placeholder="Enter your family name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-required="true"
      />
    </div>
  );
}

