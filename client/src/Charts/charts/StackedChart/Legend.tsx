import React, { useState, useCallback } from 'react';

import classnames from 'classnames/bind';

// ======================================================
// Redux and api
// ======================================================

// ======================================================
// Components and css
// ======================================================
import { Icon } from '@calltouch/ct-ui-kit';

// ======================================================
// Static
// ======================================================
import styles from './StackedChart.module.scss';

const cn: Function = classnames.bind(styles);

// ======================================================
// Types
// ======================================================
interface Props {
  legendData: Array<{
    date: string;
    metricId: string;
    color: string;
    fontColor: string;
  }>;
  maxContent?: number;
  onMouseEventColor: (metricId: string, highlight: boolean) => void;
}

// ======================================================
// Component
// ======================================================
const Legend: React.FunctionComponent<Props> = (props: Props) => {
  const { maxContent = 11, onMouseEventColor } = props;
  const [state, setState] = useState<{
    offset: number;
    metricHover: string | null;
    lastIndex: number;
  }>({
    offset: 0,
    metricHover: null,
    lastIndex: maxContent - 1,
  });

  const handleMouseEnter = useCallback(
    (metricId: string): void => {
      onMouseEventColor(metricId, true);
      setState(prevState => ({
        ...prevState,
        metricHover: metricId,
      }));
    },
    [onMouseEventColor],
  );

  const handleMouseLeave = useCallback(
    (metricId: string): void => {
      onMouseEventColor(metricId, false);
      setState(prevState => ({
        ...prevState,
        metricHover: null,
      }));
    },
    [onMouseEventColor],
  );

  const handleClickUpArrow = useCallback((): void => {
    if (state.lastIndex < props.legendData.length - 1) {
      setState(prevState => ({
        ...prevState,
        offset: prevState.offset + 32,
        lastIndex: prevState.lastIndex + 1,
      }));
    }
  }, [state.lastIndex, props.legendData.length]);

  const handleClickDownArrow = useCallback((): void => {
    if (state.lastIndex > maxContent - 1) {
      setState(prevState => ({
        ...prevState,
        offset: prevState.offset - 32,
        lastIndex: prevState.lastIndex - 1,
      }));
    }
  }, [state.lastIndex, maxContent]);

  function renderUpArrow(): React.ReactNode {
    return (
      <div
        className={cn('Arrow', 'Arrow--up', {
          'Arrow--disabled': state.lastIndex === props.legendData.length - 1,
        })}
        onClick={handleClickUpArrow}
        role="presentation"
      >
        <Icon className={cn('ArrowIcon')} name="ArrowsDownIcon" color="var(--blue)" />
      </div>
    );
  }

  function renderDownArrow(): React.ReactNode {
    return (
      <div
        className={cn('Arrow', 'Arrow--down', {
          'Arrow--disabled': state.lastIndex === maxContent - 1,
        })}
        onClick={handleClickDownArrow}
        role="presentation"
      >
        <Icon className={cn('ArrowIcon')} name="ArrowsDownIcon" color="var(--blue)" />
      </div>
    );
  }

  return (
    <div className={cn('LegendWrapper')}>
      {props.legendData.length > maxContent + 1 && renderUpArrow()}
      <div
        className={cn('Legend', { 'Legend--no-slider': props.legendData.length <= maxContent + 1 })}
      >
        <div className={cn('SliderWrapper')} style={{ top: state.offset }}>
          {props.legendData.map(elem => (
            <div
              className={cn('LegendDateItem')}
              style={{
                backgroundColor: elem.color,
                opacity: state.metricHover && state.metricHover !== elem.metricId ? 0.21 : 1,
                color: elem.fontColor,
              }}
              key={`${elem.date}__${elem.metricId}`}
              onMouseEnter={handleMouseEnter.bind(null, elem.metricId)}
              onMouseLeave={handleMouseLeave.bind(null, elem.metricId)}
            >
              {elem.date}
            </div>
          ))}
        </div>
      </div>
      {props.legendData.length > maxContent + 1 && renderDownArrow()}
    </div>
  );
};

export default Legend;
