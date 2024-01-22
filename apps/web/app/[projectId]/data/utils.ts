"use client"

import axios from 'axios';
import { ColumnProps } from './types';

export const mockApiBuilder = (projectId: string) => {
  const base = window.location.origin;
  return `${base}/api/mock/${projectId}`;
};

export const fetchTable = async (projectId: string, tableId: string) => {
  const data = await axios
    .get(`${mockApiBuilder(projectId)}/data/${tableId}`)
    .then((res) => res.data);
  return data;
};

export const fetchTableData = async (projectId, tableId, dispatch) => {
  if (projectId && tableId) {
    try {
      const data = await fetchTable(projectId, tableId);
      dispatch({
        type: 'set-data',
        payload: data,
      });
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'set-data',
        isError: true,
      });
    }
  }
};

export function checkDuplicateColumnLabel(label, cols: ColumnProps[]): boolean {
  return cols.some((col) => col.label === label);
}
