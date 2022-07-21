import React from 'react';
import classnames from 'classnames/bind';
import ScrollBar from 'react-scrollbars-custom';

// ======================================================
// Helpers and utils
// ======================================================
import formatToThousands from 'helpers/formatHelpers/formatToThousands';
import { setTime } from '../../helpers/helpers';
import { getCurrencySign } from 'pages/Reports/Journals/components/Table/helpers';

// ======================================================
// Redux and api
// ======================================================

// ======================================================
// Components and css
// ======================================================

import styles from './Tooltip.module.scss';

// ======================================================
// Types
// ======================================================
import { TooltipContent, Event } from '../../types/commonTypes';

interface Props {
  content?: TooltipContent;
  style: {
    [field: string]: string | number;
  } | null;
  usePercent?: boolean;
  useTime?: boolean;
  useCurrency?: boolean;
  isTrendFirstTooltip?: boolean;
  isTrendSecondTooltip?: boolean;
  events?: Event[];

  onHover?: (
    isCircle: boolean,
    node: HTMLElement | null,
    date: string,
    isHovered: boolean,
    params?: any,
  ) => void;
  onRowClick?: (id: string | number) => void;
  params?: any;
  round?: number | undefined;
  unit?: string | undefined;
}

// ======================================================
// Static
// ======================================================

const cn: Function = classnames.bind(styles);

function setValueWidth(hasValue: boolean, usePercent: boolean, value: string): number {
  if (!hasValue) {
    return 7;
  }
  if (usePercent) {
    return value.length + 1;
  }
  return value!.length;
}

function setUnit(
  unit: string | undefined,
  usePercent: boolean | undefined,
  useCurrency: boolean | undefined,
): string {
  if (usePercent) {
    return '%';
  }
  if (useCurrency && unit) {
    return getCurrencySign(unit);
  }
  return '';
}

// ======================================================
// Component
// ======================================================
const Tooltip: React.FunctionComponent<Props> = (props: Props) => {
  if (!props.content) {
    return null;
  }

  function onMouseEnter(): void {
    if (props.onHover) {
      props.onHover(false, null, '', true, props.params);
    }
  }

  function onMouseLeave(): void {
    if (props.onHover) {
      props.onHover(false, null, '', false, props.params);
    }
  }

  function onRowClick(id: string | number): void {
    if (props.onRowClick && id) {
      props.onRowClick(id);
    }
  }

  const height = (props.content.rows.length + 1) * 20 + 20;
  const sumRowsValues: number = props.content.rows.reduce((accum, item) => {
    return item && item.value ? accum + item.value : accum;
  }, 0);

  return (
    <div
      className={cn('Tooltip', 'ChartTooltip')}
      style={props.style ? { ...props.style, height } : { height }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <ScrollBar>
        <h4 className={cn('Title')}>
          <span className={cn('Title__left')}>{props.content.titleLeft}</span>
          {(props.content.titleRight ||
            props.isTrendFirstTooltip ||
            props.isTrendSecondTooltip) && (
            <span
              className={cn('Title__right', {
                'Title__right-trend--first': props.isTrendFirstTooltip,
                'Title__right-trend--second': props.isTrendSecondTooltip,
              })}
            >
              {props.content.titleRight}
            </span>
          )}
        </h4>
        {props.content.rows.map(item => {
          const hasValue = Boolean(item.value || item.value === 0);
          let value = hasValue ? formatToThousands(item.value!, { fixed: props.round || 0 }) : null;
          if (hasValue && props.usePercent) {
            value = formatToThousands(item.value! * 100, { fixed: 2 });
          } else if (hasValue && props.useTime) {
            value = setTime(item.value!).toString();
          }
          if (props.isTrendSecondTooltip) {
            value = sumRowsValues
              ? String(formatToThousands((Number(item.value) * 100) / sumRowsValues, { fixed: 2 }))
              : '0.00';
          }
          const valueWidth = setValueWidth(hasValue, Boolean(props.usePercent), value || '');
          const unit = setUnit(props.unit, props.usePercent, props.useCurrency);
          return (
            <div
              key={item.id}
              className={cn('Row', { 'Row--active': !!props.onRowClick })}
              role="presentation"
              onClick={() => {
                onRowClick(item.id);
              }}
            >
              <div
                className={cn('Row__color')}
                style={{ backgroundColor: item.circleColor || item.color }}
              />
              <div
                className={cn('Row__value', {
                  'Row__value--dotted': hasValue,
                })}
              >
                <span
                  className={cn('Row__text')}
                  style={{ maxWidth: hasValue ? 226 - valueWidth - 50 : 195 }}
                >
                  {item.title}
                </span>
                {hasValue && <span className={cn('Row__number')}>{`${value}${unit}`}</span>}
              </div>
            </div>
          );
        })}
      </ScrollBar>
    </div>
  );
};

export default Tooltip;
