# React Datagrid Table

[![npm version](https://badge.fury.io/js/react-shadcn-datagrid.svg)](https://badge.fury.io/js/react-shadcn-datagrid)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful, customizable, and performant data grid component for React, built with [Tailwind CSS](https://tailwindcss.com/) and [Shadcn UI](https://ui.shadcn.com/) primitives. Designed for modern web applications needing robust table functionalities.

## Features

- **Highly Customizable:** Adapt the grid to your specific needs with flexible column definitions and cell rendering.
- **Rich Cell Types:** Includes a variety of built-in cell components for different data types (text, number, boolean, date, select, multi-select, toggle, rating).
- **Pinned Columns:** Support for pinning columns to the left or right for better visibility of key data.
- **Draggable Column Headers:** Easily reorder columns with drag-and-drop functionality.
- **Column Actions Menu:** Contextual menus for column-specific operations (e.g., sorting, filtering - if implemented, or hiding).
- **Editable Cells:** Support for inline editing of cell data (via `EditColumnForm`).
- **Built with Shadcn UI:** Leverages the well-crafted and accessible components from Shadcn UI for a consistent and high-quality user experience. This grid is designed to be used in an environment where Shadcn UI is already set up.
- **Lightweight and Performant:** Optimized for handling large datasets efficiently.
- **TypeScript Support:** Fully typed for a better development experience.

## Installation

Install the package using npm, yarn, or pnpm:

```bash
npm install react-shadcn-datagrid
# or
yarn add react-shadcn-datagrid
# or
pnpm add react-shadcn-datagrid
```

## Peer Dependencies

This package relies on several peer dependencies that you need to have installed in your project:

- `react`: `>=18`
- `react-dom`: `>=18`
- `lucide-react`: `>=0.300.0` (Adjust version as needed)

Please ensure these are included in your project's `package.json`.

## Tailwind CSS Setup

`react-shadcn-datagrid` is built with Tailwind CSS and expects your project to have Tailwind CSS configured.

### For Tailwind CSS v3 and below (or projects not using `@import` for CSS sources):

To ensure Tailwind processes the classes used by this library, add the following to your `tailwind.config.js` (or `tailwind.config.ts`):

```javascript
// tailwind.config.js
module.exports = {
  content: [
    // ...your other content paths
    "./node_modules/react-shadcn-datagrid/dist/**/*.{js,ts,jsx,tsx,mjs}",
    // If you also want to include the src for development (optional):
    // "./node_modules/react-shadcn-datagrid/src/**/*.{js,ts,jsx,tsx}",
  ],
  // ...rest of your Tailwind config
};
```

### For Tailwind CSS v4+ (or projects using `@source`):

If your project uses Tailwind CSS v4 or a setup that leverages `@source` (often found in `globals.css` or your main CSS entry file), you can include the datagrid's styles like so:

```css
/* globals.css or your main CSS file */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Add the datagrid source */
@source "../node_modules/react-shadcn-datagrid"; /* Adjust path if necessary */
```

This approach is often cleaner as it directly tells Tailwind to scan the package's source or distributed files for classes based on its own configuration within the package.

**Note:** If you publish your package under a scoped name (e.g., `@your-npm-username/react-shadcn-datagrid`), replace `react-shadcn-datagrid` in the paths above with your actual package name.

## Basic Usage

Here's a simple example of how to use the `DataGrid` component:

```tsx
import React, { useState } from "react";
import { DataGrid, ColumnConfig, RowAction } from "react-shadcn-datagrid";
// Make sure to import any necessary CSS if you have a global stylesheet where Shadcn styles are imported
// import './globals.css'; // Example

interface MyDataItem {
  id: string; // Or number, ensure it's unique for keys
  name: string;
  age: number;
  isActive: boolean;
  email: string;
}

const App: React.FC = () => {
  const [data, setData] = useState<MyDataItem[]>([
    {
      id: "1",
      name: "Alice Wonderland",
      age: 30,
      isActive: true,
      email: "alice@example.com",
    },
    {
      id: "2",
      name: "Bob The Builder",
      age: 24,
      isActive: false,
      email: "bob@example.com",
    },
    {
      id: "3",
      name: "Charlie Chaplin",
      age: 35,
      isActive: true,
      email: "charlie@example.com",
    },
  ]);

  const columns: ColumnConfig<MyDataItem>[] = [
    {
      id: "name",
      header: "Full Name", // Can be a string or React.ReactNode
      type: "text",
      cell: (row) => <div>{row.name}</div>,
      minWidth: 150, // Example: from BaseColumnConfig
      maxWidth: 300, // Example: from BaseColumnConfig
      isEditable: true, // Example: from BaseColumnConfig
      // icon: <YourIcon />, // Example: from BaseColumnConfig
      label: "Full Name", // from BaseColumnConfig
    },
    {
      id: "age",
      header: <span>Age (Years)</span>, // Example of ReactNode header
      type: "number",
      cell: (row) => <span>{row.age}</span>,
      minWidth: 80,
      maxWidth: 120,
      isEditable: true,
      label: "Age",
    },
    {
      id: "isActive",
      header: "Status",
      type: "boolean",
      cell: (row) =>
        row.isActive ? (
          <span style={{ color: "green" }}>Active</span>
        ) : (
          <span style={{ color: "red" }}>Inactive</span>
        ),
      minWidth: 100,
      maxWidth: 150,
      label: "Status",
    },
    {
      id: "email",
      header: "Email Address",
      type: "text",
      cell: (row) => <a href={`mailto:${row.email}`}>{row.email}</a>,
      minWidth: 200,
      maxWidth: 350,
      label: "Email",
    },
    // Example for a 'select' type column
    // {
    //   id: "category",
    //   header: "Category",
    //   type: "select",
    //   cell: (row) => <div>{row.category}</div>, // Adjust based on how you store category
    //   selectOptions: [
    //     { label: "Tech", value: "tech" },
    //     { label: "Health", value: "health" },
    //   ],
    //   minWidth: 120,
    //   maxWidth: 200,
    //   isEditable: true,
    //   label: "Category"
    // },
  ];

  const rowActions: RowAction<MyDataItem>[] = [
    {
      label: "Edit",
      value: "edit", // Unique value for the action
      // icon: <YourEditIconComponent />, // Optional icon
      onClick: (row) => {
        console.log("Editing row:", row);
        // Implement your edit logic here, e.g., open a modal
      },
    },
    {
      label: "Delete",
      value: "delete",
      // icon: <YourDeleteIconComponent />, // Optional icon
      onClick: (row) => {
        console.log("Deleting row:", row);
        setData((prevData) => prevData.filter((item) => item.id !== row.id));
      },
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Awesome Data Grid</h1>
      <DataGrid<MyDataItem> // Explicitly type DataGrid if needed
        columns={columns}
        rows={data} // Prop for data items
        rowActions={rowActions} // Prop for row actions
        // Example of onCellSave for editable cells, adjust based on your actual prop name
        // onCellChange={(rowIndex, columnId, newValue) => {
        //   console.log('Cell Change:', { rowIndex, columnId, newValue });
        //   setData(prevData =>
        //     prevData.map((row, index) =>
        //       index === rowIndex ? { ...row, [columnId as keyof MyDataItem]: newValue } : row
        //     )
        //   );
        // }}
        // Add other props like onColumnOrderChange, onPinColumn, etc.
      />
    </div>
  );
};

export default App;
```

## Demo

Check out a live example of the `react-shadcn-datagrid` in action:

[Data Grid Example Repository](https://github.com/unnatibamania/data-grid-example)

This repository showcases various features and configurations of the data grid.

## Props API

The `DataGrid` component and its sub-components accept various props for customization and functionality.

Key exports include:

- `DataGrid`: The main data grid component.
- `ColumnConfig`: Type for defining columns (imported from your types, e.g., `import { ColumnConfig } from 'react-shadcn-datagrid/types';`).
- `RowAction`: Type for defining row actions.
- Various UI Primitives re-exported from `./ui/*` (e.g., `Table`, `Button`, `Input`, etc. - see `src/index.tsx` for a full list).
- Utility functions like `cn` from `./lib/utils`.

For detailed information on all available props and types, please refer to the TypeScript definitions (`dist/index.d.ts`) included with the package and the source code in the `src/` directory.

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details (you'll need to create this file if you haven't).

## Contributing

Contributions are welcome! If you have suggestions or find a bug, please open an issue or submit a pull request.

_(Optional: Add more specific contribution guidelines if you have them)._

## Repository

[Link to your GitHub repository](https://github.com/unnatibamania/react-shadcn-datagrid)
