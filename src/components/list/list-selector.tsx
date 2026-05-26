import { CheckSquare, Square } from "lucide-react";
import * as React from "react";

import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@/components/ui/combobox";
import { useUser } from "@/hooks/use-user";
import { client } from "@/lib/api";
import { toastManager } from "@/components/ui/toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "../ui/badge";

export function ListSelector({ mangaId }: { mangaId: string }) {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const { data: listData } = useQuery({
    queryKey: ["user-lists"],
    enabled: !!user && open,
    staleTime: Infinity,
    refetchOnMount: false,
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await client.GET("/v2/lists/user/me");
      if (error) {
        return null;
      }

      return data.data;
    },
  });
  const { data: existingListData } = useQuery({
    queryKey: ["existing-lists", mangaId],
    enabled: !!user && open,
    staleTime: Infinity,
    refetchOnMount: false,
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await client.GET("/v2/lists/user/me/manga/{mangaId}", {
        params: {
          path: {
            mangaId: mangaId,
          },
        },
      });
      if (error) {
        return null;
      }

      return data.data;
    },
  });

  async function handleAddToList(listId: string) {
    const { error } = await client.POST("/v2/lists/{id}", {
      params: {
        path: {
          id: listId,
        },
      },
      body: {
        mangaId: mangaId,
      },
    });

    if (error) {
      toastManager.add({ title: "Failed to add to list", type: "error" });
      return;
    }

    toastManager.add({
      title: "Added to list successfully",
      type: "success",
    });
    void queryClient.invalidateQueries({ queryKey: ["existing-lists"] });
  }

  return (
    <div className="flex-1">
      <Combobox items={listData?.items} open={open} onOpenChange={setOpen}>
        <ComboboxInput placeholder="Select List" size="lg" />
        <ComboboxPopup className="p-0 relative z-[2000]">
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item: components["schemas"]["UserMangaListResponse"]) => (
              <ComboboxItem
                key={item.id}
                value={item.id}
                onSelect={() => handleAddToList(item.id)}
                className="cursor-pointer flex"
              >
                <div className="flex items-center gap-2">
                  {existingListData?.includes(item.id) ? (
                    <CheckSquare className="size-4" />
                  ) : (
                    <Square className="size-4" />
                  )}
                  {item.title}
                </div>
                <Badge
                  variant={item.isPublic ? "default" : "outline"}
                  className="w-16 text-center justify-center"
                >
                  {item.isPublic ? "Public" : "Private"}
                </Badge>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>
    </div>
  );
}
