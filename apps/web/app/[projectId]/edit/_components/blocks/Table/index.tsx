import React from 'react';
import type { ComponentConfig } from '@measured/puck';
import { TableRenderer } from './table-render';

export interface TableProps {
  title?: string;
  dataSourceId: string;
}

export const Table: ComponentConfig<TableProps> = {
  fields: {
    title: { type: 'text' },
    dataSourceId: { type: 'text' }, // we could pass config here instead of id lookup inside the renderer
  },
  defaultProps: {
    dataSourceId: 'api',
  },
  render: () => {
    return (
      <div>
        <TableRenderer />
      </div>
    );
  },
};
