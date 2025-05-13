
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSessionPacks } from "@/hooks/use-packs";

interface SessionPackSelectorProps {
  selectedPack: string;
  onSelectPack: (packId: string) => void;
}

export const SessionPackSelector: React.FC<SessionPackSelectorProps> = ({
  selectedPack,
  onSelectPack,
}) => {
  const packsQuery = useSessionPacks();
  const packs = packsQuery.data || [];
  const isLoadingPacks = packsQuery.isLoading;

  return (
    <div>
      <Label htmlFor="pack">Pack</Label>
      <Select value={selectedPack} onValueChange={onSelectPack}>
        <SelectTrigger>
          <SelectValue placeholder="Select a pack" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Packs</SelectLabel>
            {isLoadingPacks ? (
              <SelectItem value="loading" disabled>Loading...</SelectItem>
            ) : (
              packs?.map((pack) => (
                <SelectItem key={pack.id} value={pack.id}>
                  {pack.subject} - {pack.sessionType}
                </SelectItem>
              ))
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
