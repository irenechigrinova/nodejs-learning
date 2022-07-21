import classnames from 'classnames/bind';
import styles from './StackedChart.module.scss';

const cn: Function = classnames.bind(styles);

export const COHORT_COLORS = [
  '#ffc107',
  '#ff9800',
  '#ff5722',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#1e66b3',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
];

export const WHITE_FONT = [3, 4, 5, 6, 7, 8];
export const BLACK_FONT = [0, 1, 2, 9, 10, 11];

export const ALONE_COLOR = '#ffc107';

export const STACK_MARGIN = 12;

// CLASSES
export const SvgClass = cn('Svg');
export const StackClass = cn('Stack');
export const StackOpacity = cn('Stack--opacity');
export const StackVisible = cn('Stack--visible');
export const MetricValueVisible = cn('MetricValue--visible');
export const ValueVisible = cn('Rect-value--visible');

export const MARGINS_STACK = {
  top: 0,
  right: 72,
  bottom: 100,
  left: 90,
};

export const MARGIN_FOR_CHART_LEGEND = 24;

export const MIN_TICK_WIDTH = 24;
export const MIN_TICK_OFFSET = 16;

export const REG_TRANSLATE_X = /translate\((\d+|\d+\.\d+)\,\d+\)/;
