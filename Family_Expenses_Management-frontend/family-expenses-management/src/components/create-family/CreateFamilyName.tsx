'use client';

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
  name: string;
  setName: (name: string) => void;
}

export default function CreateFamilyName({ name, setName }: Props) {
  return (
    <div className="space-y-4">
      {/* Nhãn hiển thị */}
      <Label htmlFor="family-name" className="text-lg font-medium">
        Tên gia đình
      </Label>
      
      {/* Ô nhập liệu */}
      <Input
        id="family-name"
        placeholder="Nhập tên gia đình của bạn (ví dụ: Gia đình họ Nguyễn)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-required="true"
      />
      
      {/* Gợi ý nhỏ (tùy chọn) */}
      <p className="text-sm text-gray-500 italic">
        Tên này sẽ được dùng để định danh nhóm quản lý chi tiêu của các thành viên.
      </p>
    </div>
  );
}