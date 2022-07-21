import React, { memo } from 'react';
import classnames from 'classnames/bind';

// ======================================================
// Helpers and utils
// ======================================================
import formatToThousands from 'helpers/formatHelpers/formatToThousands';
import { calcSum, convertTime } from '../../helpers/data-helpers';
import generateId from 'utils/generate-id';

// ======================================================
// Redux and api
// ======================================================

// ======================================================
// Components and css
// ======================================================
import styles from './Legend.module.scss';

// ======================================================
// Types
// ======================================================
import { DonutChartData } from '../../../../types/commonTypes';

interface Props {
  data: DonutChartData;
  isTechAndDevice?: boolean;
  type: string | undefined;
  unit: string | undefined;
  round: number;
}

// ======================================================
// Static
// ======================================================
import { MAIN_COLORS, ADDITIONAL_COLORS } from '../../../../helpers/consts';

const cn: Function = classnames.bind(styles);
const COLORS = [...MAIN_COLORS, ...ADDITIONAL_COLORS];

// ======================================================
// Component
// ======================================================
const Legend: React.FunctionComponent<Props> = (props: Props) => {
  const { columns, data, usePercent } = props.data;
  const sum = usePercent ? calcSum(data) : 0;

  return (
    <div className={cn('Legend')}>
      <table className={cn('Table')}>
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.id}>{column.name}</th>
            ))}
            {usePercent && <th key="percent">Доля, %</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id}>
              <td>
                <div className={cn('Metric')}>
                  <div className={cn('Color')} style={{ backgroundColor: COLORS[index] }} />
                  <span className={cn('Metric__name')}>{item.name}</span>
                </div>
              </td>
              {item.values.map((value, valueIndex) => {
                const formatted: string =
                  props.type === 'currency'
                    ? formatToThousands(value, { fixed: 2 })
                    : formatToThousands(value, { fixed: props.round });
                const res: string =
                  props.type === 'currency' && formatted.indexOf('.') === -1
                    ? `${formatted}.00`
                    : formatted;
                if (
                  props.isTechAndDevice &&
                  valueIndex === item.values.length - 1 &&
                  item.values.length === 3
                ) {
                  return (
                    <td key={generateId()}>
                      {`${formatToThousands(Number(value) * 100, { fixed: 2 })}%`}
                    </td>
                  );
                }
                return (
                  <td key={generateId()}>
                    {props.type === 'time' ? convertTime(Number(value)) : res}
                    {props.type === 'currency' && props.unit}
                  </td>
                );
              })}
              {usePercent && (
                <td>
                  {item.values[0] === 0
                    ? '0.00%'
                    : `${formatToThousands((Number(item.values[0]) / sum) * 100, {
                        fixed: 2,
                      })}%`}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function arePropsEqual(): boolean {
  return true;
}

export default memo(Legend, arePropsEqual);
