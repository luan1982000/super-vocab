import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowClockwise,
  CaretRight,
  CheckCircle,
  ListBullets,
  Plus,
} from "@phosphor-icons/react";
import { CollectionBar } from "../components/CollectionBar";
import { VocabForm } from "../components/VocabForm";
import { useCards } from "../hooks/useCards";
import { useCollections } from "../hooks/useCollections";
import {
  SCOPE_ALL,
  SCOPE_NONE,
  type CollectionScope,
} from "../lib/collections";
import { supabase } from "../lib/supabase";
import type { CardInput } from "../lib/types";

/** Ghi một từ mới. Danh sách từ nằm ở trang riêng (`/vocab/list`). */
export function VocabPage() {
  const {
    collections,
    error: collectionsError,
    reload: reloadCollections,
  } = useCollections();
  const { rows, setRows, error: loadError, reload } = useCards();
  const [scope, setScope] = useState<CollectionScope>(SCOPE_ALL);
  const [createError, setCreateError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Tăng sau mỗi lần thêm thành công: đổi `key` để phiếu "Thêm từ" remount về trạng thái trống.
  const [formReset, setFormReset] = useState(0);
  const [addedWord, setAddedWord] = useState<string | null>(null);

  const counts = useMemo(() => {
    const result: Record<string, number> = {
      [SCOPE_ALL]: rows.length,
      [SCOPE_NONE]: 0,
    };
    for (const collection of collections) result[collection.id] = 0;
    for (const row of rows) {
      const key = row.collection_id ?? SCOPE_NONE;
      if (key in result) result[key] += 1;
    }
    return result;
  }, [rows, collections]);

  // Từ thêm mới mặc định vào bộ đang chọn ở dải chip.
  const defaultCollectionId =
    scope === SCOPE_ALL || scope === SCOPE_NONE ? null : scope;

  // Xoá/đổi tên bộ từ cũng đổi dữ liệu cards (FK set null) → nạp lại cả hai.
  const reloadAll = async () => {
    await reloadCollections();
    reload();
  };

  const handleCreate = async (values: CardInput) => {
    setCreateError(null);
    setAddedWord(null);

    if (
      rows.some(
        (row) =>
          row.word.trim().toLowerCase() === values.word.trim().toLowerCase(),
      )
    ) {
      setCreateError(`Từ "${values.word}" đã có trong danh sách.`);
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("cards")
      .insert(values)
      .select()
      .single();
    setSaving(false);
    if (error) setCreateError(error.message);
    else {
      setRows((prev) => [data, ...prev]);
      setFormReset((prev) => prev + 1);
      setAddedWord(data.word);
    }
  };

  return (
    <div className="space-y-8">
      <section className="panel p-5 sm:p-8">
        <header className="mb-6">
          <h1 className="font-serif text-[1.625rem] leading-tight tracking-[-0.015em] text-ink">
            Thêm từ
          </h1>
          <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-ink-soft">
            Chỉ cần điền từ và nghĩa. Phát âm, ví dụ và ghi chú có thể bổ sung
            sau.
          </p>
        </header>

        <VocabForm
          key={`create-${defaultCollectionId ?? "none"}-${formReset}`}
          idPrefix="create"
          collections={collections}
          defaultCollectionId={defaultCollectionId}
          submitLabel="Thêm từ"
          submitIcon={<Plus aria-hidden size={16} weight="bold" />}
          busy={saving}
          onSubmit={(values) => void handleCreate(values)}
        />

        {createError && (
          <p className="banner mt-4" role="alert">
            {createError}
          </p>
        )}
        {addedWord && !createError && (
          <p className="notice mt-4" role="status">
            <CheckCircle
              aria-hidden
              size={18}
              weight="fill"
              className="mt-0.5 shrink-0 text-accent"
            />
            <span>
              Đã thêm{" "}
              <strong className="font-serif font-semibold text-ink">
                {addedWord}
              </strong>
              .{" "}
              <Link
                to="/vocab/list"
                className="font-medium text-accent underline underline-offset-2"
              >
                Xem trong danh sách
              </Link>
            </span>
          </p>
        )}
      </section>

      <section className="space-y-5">
        <CollectionBar
          collections={collections}
          scope={scope}
          counts={counts}
          onScopeChange={setScope}
          manage
          onChanged={reloadAll}
          error={collectionsError}
        />

        {loadError && (
          <div
            className="banner flex flex-wrap items-center gap-x-3 gap-y-1"
            role="alert"
          >
            <span>Không tải được dữ liệu: {loadError}</span>
            <button
              type="button"
              onClick={reload}
              className="btn-text font-medium text-ink underline"
            >
              <ArrowClockwise aria-hidden size={16} />
              Thử lại
            </button>
          </div>
        )}

        <Link to="/vocab/list" className="link-row">
          <ListBullets
            aria-hidden
            size={22}
            className="shrink-0 text-ink-soft"
          />
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-ink">
              Danh sách từ vựng
            </span>
            <span className="block text-sm text-ink-soft">
              Xem và chỉnh các từ đã thêm
            </span>
          </span>
          <span className="tnum rounded-full bg-hover px-2.5 py-0.5 text-sm font-medium text-ink">
            {rows.length}
          </span>
          <CaretRight
            aria-hidden
            size={16}
            className="shrink-0 text-ink-soft"
          />
        </Link>
      </section>
    </div>
  );
}
