import { Table } from 'react-feather';

export const TextWithIcon = ({ children, icon, ...props }) => (
  <div className="flex items-center space-x-4" {...props}>
    <div>{icon}</div>
    <div>{children}</div>
  </div>
);

export const TableTextWithIcon = ({ children, ...props }) => (
  <div className="flex items-center space-x-6" {...props}>
    <div>
      {' '}
      <Table />{' '}
    </div>
    <div>{children}</div>
  </div>
);
