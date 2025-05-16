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
- **Built with Shadcn UI:** Leverages the well-crafted and accessible components from Shadcn UI for a consistent and high-quality user experience.
- **Lightweight and Performant:** Optimized for handling large datasets efficiently.
- **TypeScript Support:** Fully typed for a better development experience.

## Installation

Install the package using npm, yarn, or pnpm:

```bash
npm install react-shadcn-datagrid 

yarn add react-shadcn-datagrid 

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

**Note:** If you publish your package under a scoped name (e.g., `@your-npm-username/react-shadcn-datagrid`), replace `react-shadcn-datagrid` in the path above with your actual package name.

## Basic Usage

Here's a simple example of how to use the `DataGrid` component:

```tsx
import React, { useState } from "react";
import { DataGrid, ColumnDef } from "react-shadcn-datagrid"; // or '@your-npm-username/react-shadcn-datagrid'
// Make sure to import any necessary CSS if you have a global stylesheet where Shadcn styles are imported
// import './globals.css'; // Example

interface MyDataItem {
  id: number;
  name: string;
  age: number;
  isActive: boolean;
}

const App: React.FC = () => {
  const [data, setData] = useState<MyDataItem[]>([
    { id: 1, name: "Alice", age: 30, isActive: true },
    { id: 2, name: "Bob", age: 24, isActive: false },
    { id: 3, name: "Charlie", age: 35, isActive: true },
  ]);

  const columns: ColumnDef<MyDataItem>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cellType: "text", // Example cell type
    },
    {
      accessorKey: "age",
      header: "Age",
      cellType: "number",
    },
    {
      accessorKey: "isActive",
      header: "Active",
      cellType: "boolean",
    },
    // Add more column definitions as needed
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Awesome Data Grid</h1>
      <DataGrid
        columns={columns}
        data={data}
        // Add other props as needed, e.g., for editing, row actions, etc.
        // onEditCell={(rowIndex, columnId, value) => {
        //   console.log('Edit:', rowIndex, columnId, value);
        //   // Update your data state here
        // }}
      />
    </div>
  );
};

export default App;
```

## Props API

The `DataGrid` component and its sub-components accept various props for customization and functionality.

Key exports include:

- `DataGrid`: The main data grid component.
- `ColumnDef`: Type for defining columns.
- `CellContext`: Type for cell context.
- Various UI Primitives re-exported from `./ui/*` (e.g., `Table`, `Button`, `Input`, etc. - see `src/index.tsx` for a full list).
- Utility functions like `cn` from `./lib/utils`.

For detailed information on all available props and types, please refer to the TypeScript definitions (`dist/index.d.ts`) included with the package and the source code in the `src/` directory.

_(Consider adding a link here to more detailed API documentation if you plan to create it, e.g., using Storybook or a documentation generator)._

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details (you'll need to create this file if you haven't).

## Contributing

Contributions are welcome! If you have suggestions or find a bug, please open an issue or submit a pull request.

_(Optional: Add more specific contribution guidelines if you have them)._

## Repository

[Link to your GitHub repository](https://github.com/your-username/your-repo-url) _(Replace with your actual repository URL)_
