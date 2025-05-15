// Define Sort Direction type
export type SortDirection = "asc" | "desc";

// --- Class Name Definitions ---
export interface DataGridClassNames {
  root?: string;
  table?: string;
  header?: {
    wrapper?: string;
    row?: string;
    cell?: string;
    dragHandle?: string;
    resizeHandle?: string;
  };
  body?: {
    wrapper?: string;
    row?: string;
    selectedRow?: string;
    cell?: string;
  };
  components?: {
    badge?: string;
    checkbox?: string;
    ratingStar?: string;
    toggleSwitch?: string;
    dateTrigger?: string;
    calendar?: string;
    selectTrigger?: string;
    selectContent?: string;
    selectItem?: string;
    multiSelectTrigger?: string;
    multiSelectContent?: string;
    multiSelectCommand?: string;
    multiSelectInput?: string;
    multiSelectItem?: string;
  };
}
// --- End Class Name Definitions ---
