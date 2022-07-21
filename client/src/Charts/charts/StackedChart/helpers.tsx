import React from 'react';
import * as d3Selection from 'd3-selection';
import * as d3 from 'd3';

// ======================================================
// Consts
// ======================================================
import { ALONE_COLOR } from './consts';
import {
  createYScale,
  createXScale,
} from 'containers/D3Charts/charts/LinearChart/helpers/scale-helpers';

// ======================================================
// Types
// ======================================================
import { Data, DataItem, Period, ChartType } from 'containers/D3Charts/types/commonTypes';

export function createLineByPoint({
  data,
  svg,
  width,
  height,
  cn,
  onHover,
  colorChart,
  countFromZero,
  periodType,
  chartType,
  chartRef,
}: {
  data: Data;
  svg: d3Selection.Selection<SVGGElement, any, any, any>;
  width: number;
  height: number;
  cn: Function;
  colorChart?: Array<string>;
  onHover?: Function;
  periodType: Period;
  chartType: ChartType;
  countFromZero?: boolean;
  chartRef?: React.MutableRefObject<HTMLDivElement | undefined>;
}): void {
  if (!svg) {
    return;
  }

  const color = colorChart || ALONE_COLOR;

  const { y, maxY } = createYScale(data, height, countFromZero);
  const x = createXScale(data, width, periodType, chartType);

  const chartLine = (svg as any)
    .append('path')
    .datum(data)
    .attr('class', `${cn('ChartLine')}`)
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', 1)
    .attr('stroke-linecap', 'butt')
    .attr(
      'd',
      d3
        .line()
        .defined(function(d) {
          return (
            ((d as unknown) as DataItem).value !== null &&
            ((d as unknown) as DataItem).value !== undefined
          );
        })
        .x(d => {
          // @ts-ignore
          return x(d.date) as number;
        })
        .y(d => {
          if (maxY === 0) {
            return height;
          }
          const yValue = y(((d as unknown) as DataItem).value!);
          return yValue === undefined ? height : yValue;
        }),
    )
    .on('mouseenter', function() {
      if (onHover) onHover(true);
    })
    .on('mouseleave', function() {
      if (onHover) onHover(false);
    });
  if (chartRef && chartRef.current) {
    chartLine.attr(
      'transform',
      d3
        .select(chartRef.current as HTMLDivElement)
        .select(`.${cn('XAxisLabel')} .tick:nth-child(1)`)
        .attr('transform'),
    );
  }
}

export function addText(
  g: d3Selection.Selection<SVGGElement, any, any, any>,
  text: number | string,
  currentY: number,
  length: number,
  translateY: number,
  classNames: Array<string>,
): d3Selection.Selection<SVGTextElement, any, any, any> {
  const textNode = g
    .append('text')
    .attr('class', `${classNames.join(' ')}`)
    .attr('y', () => {
      return currentY;
    })
    .attr('transform', `translate(${-length / 2}, ${translateY + 4})`)
    .text(text);
  return textNode;
}

/** длина текста значения */
export function getLengthValue(value: number | string, offset = 0): number {
  let length = 0;
  String(value)
    .split('')
    .forEach(item => {
      if (item === ' ') {
        length += 5;
      } else length += 6;
    });
  return length + offset;
}
