declare module 'wx-react-gantt' {
  export interface GanttTask {
    id: string | number;
    text: string;
    start: Date;
    end: Date;
    duration?: number;
    progress?: number;
    type?: 'task' | 'summary' | 'milestone';
    parent?: string | number;
    color?: string;
    details?: string;
    lazy?: boolean;
    dueDate?: string;
  }

  export interface GanttLink {
    id: string | number;
    source: string | number;
    target: string | number;
    type: 'e2s' | 's2s' | 'e2e' | 's2e';
  }

  export interface GanttScale {
    unit: 'month' | 'day' | 'week' | 'year' | 'hour' | 'quarter';
    step: number;
    format: string;
    css?: string;
  }

  export interface GanttColumn {
    id: string;
    header: string;
    width?: number;
    flexgrow?: number;
    align?: 'left' | 'center' | 'right';
  }

  export interface GanttProps {
    tasks?: GanttTask[];
    links?: GanttLink[];
    scales?: GanttScale[];
    columns?: GanttColumn[];
    cellWidth?: number;
    cellHeight?: number;
    scaleHeight?: number;
    readonly?: boolean;
    lengthUnit?: 'hour' | 'day' | 'week' | 'month' | 'quarter';
    start?: Date; // Add start property
    end?: Date;   // Add end property
  }

  export const Gantt: React.FC<GanttProps>;
  export const Willow: React.FC<{ children: React.ReactNode }>;
  export const WillowDark: React.FC<{ children: React.ReactNode }>;
}
