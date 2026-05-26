import { Image } from "@/components/image";
import { Field, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  ResponsiveModal,
  ResponsiveModalPanel,
  ResponsiveModalPopup,
  ResponsiveModalTrigger,
} from "@/components/ui/responsive-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toastManager } from "@/components/ui/toast";
import { useConfirm } from "@/contexts/confirm-context";
import { useUser } from "@/hooks/use-user";
import { client } from "@/lib/api";
import { StorageManager } from "@/lib/storage";
import type { components } from "@/types/api";
import { useDebouncedValue } from "@tanstack/react-pacer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, Star, X } from "lucide-react";
import { useEffect, useReducer, useRef, useState } from "react";
import { Button } from "../ui/button";

type UploadResponse = components["schemas"]["UploadResponse"];

const EMPTY_FAVORITES: string[] = [];

interface AttachmentPopoverProps {
  onSelect?: (upload: UploadResponse) => void;
}

function ImageGrid({
  uploads,
  isLoading,
  onSelect,
  emptyMessage,
  onClose,
  onDelete,
  onToggleFavorite,
  favorites = EMPTY_FAVORITES,
}: {
  uploads: UploadResponse[];
  isLoading: boolean;
  onSelect?: (upload: UploadResponse) => void;
  emptyMessage: string;
  onClose: () => void;
  onDelete?: (upload: UploadResponse) => void;
  onToggleFavorite?: (upload: UploadResponse) => void;
  favorites?: string[];
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 overflow-y-auto">
      {isLoading ? (
        <>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted rounded animate-pulse" />
          ))}
        </>
      ) : uploads.length > 0 ? (
        <>
          {uploads.map((upload) => (
            <div key={upload.id} className="relative aspect-square w-full">
              <button
                onClick={() => {
                  onSelect?.(upload);
                  onClose();
                }}
                className="w-full h-full overflow-hidden rounded border hover:border-primary transition-colors"
              >
                <Image
                  src={upload.url!}
                  alt={upload.tags.join(", ")}
                  className="w-full h-full object-contain"
                  height={96}
                  width={96}
                  sizes={{
                    default: "50vw",
                    sm: 240,
                    md: 240,
                  }}
                  quality={40}
                />
              </button>
              {onToggleFavorite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(upload);
                  }}
                  className="absolute top-1 left-1 bg-background/80 backdrop-blur-sm rounded-full p-1 hover:bg-background transition-colors"
                  aria-label="Toggle favorite"
                >
                  <Star
                    className={`h-3 w-3 ${
                      favorites.includes(upload.id)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(upload);
                  }}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80 transition-colors"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          ))}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      )}
    </div>
  );
}

// TODO: Extract FormState and formReducer into a separate component to reduce AttachmentPopover size
type FormState = {
  file: File | null;
  uploading: boolean;
  isDragOver: boolean;
  previewUrl: string | null;
  tags: string;
};

type FormAction =
  | { type: "SET_FILE"; file: File | null }
  | { type: "SET_PREVIEW_URL"; previewUrl: string | null }
  | { type: "SET_UPLOADING"; uploading: boolean }
  | { type: "SET_DRAG_OVER"; isDragOver: boolean }
  | { type: "SET_TAGS"; tags: string }
  | { type: "RESET" };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FILE":
      return { ...state, file: action.file };
    case "SET_PREVIEW_URL":
      return { ...state, previewUrl: action.previewUrl };
    case "SET_UPLOADING":
      return { ...state, uploading: action.uploading };
    case "SET_DRAG_OVER":
      return { ...state, isDragOver: action.isDragOver };
    case "SET_TAGS":
      return { ...state, tags: action.tags };
    case "RESET":
      return {
        file: null,
        uploading: false,
        isDragOver: false,
        previewUrl: null,
        tags: "",
      };
  }
}

export function AttachmentPopover({ onSelect }: AttachmentPopoverProps) {
  const [open, setOpen] = useState(false);
  const [{ file, uploading, isDragOver, previewUrl, tags }, dispatchForm] = useReducer(
    formReducer,
    {
      file: null,
      uploading: false,
      isDragOver: false,
      previewUrl: null,
      tags: "",
    },
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: user } = useUser();
  const { confirm } = useConfirm();

  const toggleFavorite = (upload: UploadResponse) => {
    const storage = StorageManager.get("favoriteAttachments");
    const current = storage.getWithDefaults();
    const currentIds = current.ids as string[];

    const index = currentIds.indexOf(upload.id);
    let newIds: string[];

    if (index > -1) {
      newIds = currentIds.filter((_, i) => i !== index);
    } else {
      newIds = [...currentIds, upload.id];
    }

    storage.set({ ids: newIds });
    setFavorites(newIds);

    void queryClient.invalidateQueries({ queryKey: ["favorite-uploads"] });
  };

  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, {
    wait: 300,
  });

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      dispatchForm({ type: "SET_PREVIEW_URL", previewUrl: url });
      return () => URL.revokeObjectURL(url);
    } else {
      dispatchForm({ type: "SET_PREVIEW_URL", previewUrl: null });
    }
  }, [file]);

  useEffect(() => {
    return () => {
      if (file) {
        URL.revokeObjectURL(URL.createObjectURL(file));
      }
    };
  }, [file]);

  const { data: uploads = [], isLoading } = useQuery({
    queryKey: ["uploads", debouncedSearchQuery],
    queryFn: async () => {
      const { data } = await client.GET("/v2/uploads", {
        params: {
          query: {
            page: 1,
            pageSize: 50,
            query: debouncedSearchQuery,
          },
        },
      });
      return data?.data?.items || [];
    },
    enabled: open,
  });

  const { data: myUploads = [], isLoading: isLoadingMy } = useQuery({
    queryKey: ["my-uploads"],
    queryFn: async () => {
      const { data } = await client.GET("/v2/uploads/me", {
        params: { query: { page: 1, pageSize: 50 } },
      });
      return data?.data?.items || [];
    },
    enabled: open && !!user,
  });

  // Fetch favorite uploads from API
  const { data: favoriteUploads = [], isLoading: isLoadingFavorites } = useQuery({
    queryKey: ["favorite-uploads", favorites],
    queryFn: async () => {
      if (favorites.length === 0) return [];

      const { data, error } = await client.POST("/v2/uploads/batch", {
        body: { ids: favorites },
      });

      if (error || !data?.data) return [];

      // Filter out deleted attachments
      const validUploads = data.data.filter((upload) => !upload.deleted);
      const validIds = validUploads.map((upload) => upload.id);

      // Check if any favorites were deleted and update storage
      const deletedIds = favorites.filter((id) => !validIds.includes(id));
      if (deletedIds.length > 0) {
        const storage = StorageManager.get("favoriteAttachments");
        storage.set({ ids: validIds });
        setFavorites(validIds);
      }

      return validUploads;
    },
    enabled: open && favorites.length > 0,
  });

  const handleUpload = async (values: Record<string, unknown>) => {
    if (!file) return;

    dispatchForm({ type: "SET_UPLOADING", uploading: true });
    const formData = new FormData();
    formData.append("file", file);

    const tagsArray = (values.tags as string).split(",").flatMap((t: string) => {
      const trimmed = t.trim();
      return trimmed ? [trimmed] : [];
    });
    tagsArray.forEach((tag) => formData.append("tags", tag));

    try {
      const { data } = await client.POST("/v2/uploads", {
        body: formData as unknown as undefined,
      });
      if (data) {
        void queryClient.invalidateQueries({ queryKey: ["uploads"] });
        onSelect?.(data.data);
        dispatchForm({ type: "RESET" });
        setOpen(false);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      dispatchForm({ type: "SET_UPLOADING", uploading: false });
    }
  };

  const handleDelete = async (upload: UploadResponse) => {
    const confirmed = await confirm({
      title: "Confirm Deletion",
      description: "Are you sure you want to delete this upload?",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!confirmed) return;

    try {
      const { error } = await client.DELETE("/v2/uploads/{id}", {
        params: {
          path: { id: upload.id },
        },
      });

      if (error) {
        toastManager.add({
          title: "Failed to delete upload",
          type: "error",
        });
        throw new Error(error.data.message || "Failed to delete upload");
      }

      toastManager.add({ title: "Upload deleted", type: "success" });
      void queryClient.invalidateQueries({ queryKey: ["my-uploads"] });
    } catch (error) {
      console.error("Failed to delete upload:", error);
      return;
    }
  };

  return (
    <ResponsiveModal desktop="dialog" open={open} onOpenChange={setOpen}>
      <ResponsiveModalTrigger>
        <Button
          variant="outline"
          size="sm"
          className="size-8 p-0"
          disabled={!user}
          aria-label="Manage Attachments"
        >
          <ImageIcon className="size-4" />
        </Button>
      </ResponsiveModalTrigger>
      <ResponsiveModalPopup showCloseButton={false}>
        <ResponsiveModalPanel>
          <Tabs
            defaultValue="select"
            className="w-full text-base flex flex-col-reverse md:flex-col"
          >
            <TabsList className="w-full">
              <TabsTrigger value="select">Select</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              {user && <TabsTrigger value="my-uploads">My Uploads</TabsTrigger>}
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="select" className="space-y-2">
              <h4 className="font-medium">Select an image</h4>
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search images..."
                className="w-full"
              />
              <ImageGrid
                uploads={uploads}
                isLoading={isLoading}
                onSelect={onSelect}
                emptyMessage="No images found."
                onClose={() => setOpen(false)}
                onToggleFavorite={toggleFavorite}
                favorites={favorites}
              />
            </TabsContent>
            <TabsContent value="favorites" className="space-y-2">
              <h4 className="font-medium">Favorite images</h4>
              <ImageGrid
                uploads={favoriteUploads}
                isLoading={isLoadingFavorites}
                onSelect={onSelect}
                emptyMessage="No favorite images yet."
                onClose={() => setOpen(false)}
                onToggleFavorite={toggleFavorite}
                favorites={favorites}
              />
            </TabsContent>
            <TabsContent value="upload" className="space-y-2">
              <h4 className="font-medium">Upload an image</h4>
              <Form onFormSubmit={handleUpload} className="space-y-2">
                <div
                  role="button"
                  tabIndex={0}
                  className={`border-2 border-dashed bg-background rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    isDragOver ? "border-primary bg-primary/10" : "border-muted-foreground/25"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    dispatchForm({
                      type: "SET_DRAG_OVER",
                      isDragOver: true,
                    });
                  }}
                  onDragLeave={() =>
                    dispatchForm({
                      type: "SET_DRAG_OVER",
                      isDragOver: false,
                    })
                  }
                  onDrop={(e) => {
                    e.preventDefault();
                    dispatchForm({
                      type: "SET_DRAG_OVER",
                      isDragOver: false,
                    });
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      dispatchForm({
                        type: "SET_FILE",
                        file: files[0],
                      });
                    }
                  }}
                >
                  {file ? (
                    <div className="space-y-2">
                      <Image
                        src={previewUrl!}
                        alt="Preview"
                        className="max-h-20 mx-auto rounded"
                        height={80}
                        width={80}
                        sizes={{ default: "80px" }}
                      />
                      <p>{file.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="size-8 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">Drop image here or click to select</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    dispatchForm({
                      type: "SET_FILE",
                      file: e.target.files?.[0] || null,
                    })
                  }
                  className="hidden"
                />
                <Field name="tags">
                  <FieldLabel className="sr-only">Tags</FieldLabel>
                  <Input
                    type="text"
                    placeholder="Enter tags separated by commas (optional)"
                    value={tags}
                    onChange={(e) =>
                      dispatchForm({
                        type: "SET_TAGS",
                        tags: e.target.value,
                      })
                    }
                  />
                </Field>
                <Button type="submit" size="sm" disabled={!file || uploading} className="w-full">
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </Form>
            </TabsContent>
            {user && (
              <TabsContent value="my-uploads" className="space-y-2">
                <h4 className="font-medium">My uploads</h4>
                <ImageGrid
                  uploads={myUploads}
                  isLoading={isLoadingMy}
                  onSelect={onSelect}
                  emptyMessage="No uploads found."
                  onClose={() => setOpen(false)}
                  onDelete={handleDelete}
                  onToggleFavorite={toggleFavorite}
                  favorites={favorites}
                />
              </TabsContent>
            )}
          </Tabs>
        </ResponsiveModalPanel>
      </ResponsiveModalPopup>
    </ResponsiveModal>
  );
}
