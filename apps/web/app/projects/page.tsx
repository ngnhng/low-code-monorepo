'use client';

import './styles.css';

import Link from 'next/link';

import Icon from 'components/icons/icon';

const TableCell = ({
  projectId,
  children,
}: {
  projectId: string;
  children?: JSX.Element | string;
}) => {
  return (
    <td>
      <Link href={`/${projectId}`}>{children}</Link>
    </td>
  );
};

export default function Page() {
  return (
    <div className="page">
      <div className="labels">
        <div className="bigLabel">Projects Manager</div>
        <div className="motto">What do you want to do today?</div>
      </div>
      <table className="projectList">
        <thead>
          <tr>
            <th></th>
            <th>Project Name</th>
            <th>Last edited</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <TableCell projectId="trollface">
              <Icon src="/project.png" width={20} height={20} />
            </TableCell>
            <TableCell projectId="trollface">This is a project name</TableCell>
            <TableCell projectId="trollface">1 month ago</TableCell>
            <td>
              <button>
                <Icon src="/more.png" width={20} height={20} />
              </button>
            </td>
          </tr>
          <tr>
            <TableCell projectId="trollface">
              <Icon src="/project.png" width={20} height={20} />
            </TableCell>
            <TableCell projectId="trollface">This is a project name</TableCell>
            <TableCell projectId="trollface">1 month ago</TableCell>
            <td>
              <button>
                <Icon src="/more.png" width={20} height={20} />
              </button>
            </td>
          </tr>
          <tr>
            <TableCell projectId="trollface">
              <Icon src="/project.png" width={20} height={20} />
            </TableCell>
            <TableCell projectId="trollface">This is a project name</TableCell>
            <TableCell projectId="trollface">1 month ago</TableCell>
            <td>
              <button>
                <Icon src="/more.png" width={20} height={20} />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
