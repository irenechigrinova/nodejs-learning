import React, { memo, useEffect, useState, useRef } from 'react';
import classnames from 'classnames/bind';
import { isEqual } from 'lodash';

// ======================================================
// Helpers and utils
// ======================================================
import generateId from 'utils/generate-id';
import { setColor } from '../../../../helpers/helpers';

// ======================================================
// Redux and api
// ======================================================

// ======================================================
// Components and css
// ======================================================
import { Checkbox } from '@calltouch/ct-ui-kit';

import styles from './Legend.module.scss';

// ======================================================
// Types
// ======================================================
import { LegendData } from '../../types';

interface Props {
  data: LegendData;
  disabledMetrics: string[];
  pageId: string;
  isLinearInDashboard?: boolean;
  onMouseEnterColor: (metricId: string) => void;
  onMouseLeaveColor: () => void;
  onClickColor: (index: number, metricId: string) => void;
}

// ======================================================
// Static
// ======================================================
import { PAGES } from 'consts';
import {
  ADDITIONAL_COLORS,
  MAIN_COLORS,
  ANTIFRAUD_MAIN_COLORS,
  ANTIFRAUD_ADDITIONAL_COLORS,
} from '../../../../helpers/consts';

const cn: Function = classnames.bind(styles);

// ======================================================
// Component
// ======================================================
const Legend: React.FunctionComponent<Props> = (props: Props) => {
  const isDashboard =
    props.pageId === PAGES.DASHBOARD_SETTINGS_EDIT ||
    props.pageId === PAGES.DASHBOARD_REPORT ||
    props.pageId === PAGES.DASHBOARD_SETTINGS_ADD;
  const isAntifraud = props.pageId === PAGES.ANTI_FRAUD;

  const legendRef = useRef<HTMLDivElement>();
  const columnsRef = useRef<HTMLDivElement>();
  const [widthParams, setWidthParams] = useState<{ titleWidth: string; columnWidth: string }>({
    titleWidth: '',
    columnWidth: '',
  });
  const metricsSum = props.data.columns.length * props.data.columns[0].metrics.length;
  const lastSelected = metricsSum - props.disabledMetrics.length === 1;

  useEffect(() => {
    updateWidth();
    window.addEventListener('resize', updateWidth);

    return (): void => {
      window.removeEventListener('resize', updateWidth);
    };
  }, [props.data.columns.length]);

  function getLegendRef(node: HTMLDivElement): void {
    if (node) {
      legendRef.current = node;
    }
  }

  function getColumnsRef(node: HTMLDivElement): void {
    if (node) {
      columnsRef.current = node;
    }
  }

  function updateWidth(): void {
    if (legendRef.current && columnsRef.current) {
      const width = legendRef.current.clientWidth;
      let columnsSumWidth = 0;
      columnsRef.current.childNodes.forEach(node => {
        columnsSumWidth += (node as HTMLDivElement).clientWidth;
      });
      const columnsWidth = columnsRef.current.clientWidth;
      if (width - columnsSumWidth > 100) {
        const titleWidth = `${width - columnsWidth}px`;
        const columnWidth = `${columnsWidth / props.data.columns.length}px`;
        setWidthParams({
          titleWidth,
          columnWidth,
        });
      } else {
        setWidthParams({
          titleWidth: `calc(100% / ${props.data.columns.length + 1})`,
          columnWidth: `calc(100% / ${props.data.columns.length + 1})`,
        });
      }
    }
  }

  function handleMetricMouseEnter(event: React.MouseEvent, params: string): void {
    const [metricId] = params.split(' ');
    props.onMouseEnterColor(metricId);
  }

  function handleMetricMouseLeave(): void {
    props.onMouseLeaveColor();
  }

  function handleMetricClick(value: boolean, params: string): void {
    const [metricId, metricIndex] = params.split(' ');
    props.onClickColor(Number(metricIndex), metricId);
  }

  return (
    <div
      className={cn('Legend', {
        'Legend--dashboard': isDashboard,
        'Legend--dashboard-linear': props.isLinearInDashboard,
      })}
      ref={getLegendRef}
    >
      {(!isDashboard || props.isLinearInDashboard) && (
        <div
          className={cn('Column', { 'Column--hidden': widthParams.titleWidth.length === 0 })}
          style={{
            maxWidth: widthParams.titleWidth,
            marginRight: widthParams.titleWidth.indexOf('calc') === -1 ? 24 : 0,
          }}
        >
          {props.data.titles.map((title, index) => (
            <div
              className={cn('Column__row', 'Column__row--title', 'Column__name', {
                'Column__name--title': index === 0,
                'Column--hidden': widthParams.titleWidth.length === 0,
              })}
              key={generateId()}
            >
              {`${title.name}${title.type === 'percent' ? ', %' : ''}`}
            </div>
          ))}
        </div>
      )}
      <div className={cn('Columns')} ref={getColumnsRef}>
        {props.data.columns.map((column, index) => {
          return (
            <div
              className={cn('Column', { 'Column--hidden': widthParams.titleWidth.length === 0 })}
              key={generateId()}
              style={{ maxWidth: widthParams.columnWidth }}
            >
              <div className={cn('Column__name', 'Column__row', 'Column__name--title')}>
                {column.columnName}
              </div>
              {column.metrics.map(metric => {
                let color = metric.isMain ? MAIN_COLORS : ADDITIONAL_COLORS;
                if (isAntifraud) {
                  color = metric.isMain ? ANTIFRAUD_MAIN_COLORS : ANTIFRAUD_ADDITIONAL_COLORS;
                }
                return (
                  <div className={cn('Column__row')} key={metric.id}>
                    <div
                      className={cn('Column__checkbox', {
                        'Column__checkbox--main': metric.isMain,
                      })}
                    >
                      <Checkbox
                        checked={!props.disabledMetrics.includes(metric.id)}
                        backgroundColor={color[index] || setColor(index)}
                        onChange={handleMetricClick}
                        onMouseEnter={handleMetricMouseEnter}
                        onMouseLeave={handleMetricMouseLeave}
                        params={`${metric.id} ${index}`}
                        disabled={!props.disabledMetrics.includes(metric.id) && lastSelected}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

function arePropsEqual(prevProps: Props, nextProps: Props): boolean {
  return isEqual(prevProps.disabledMetrics, nextProps.disabledMetrics);
}

export default memo(Legend, arePropsEqual);
