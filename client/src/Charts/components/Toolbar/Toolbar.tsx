import React, { useContext, useMemo } from 'react';
import classnames from 'classnames/bind';

// ======================================================
// Helpers and utils
// ======================================================
import DataContext from '../../context/DataContext';
import generateId from 'utils/generate-id';

// ======================================================
// Redux and api
// ======================================================

// ======================================================
// Components and css
// ======================================================
import { Icon, Tabs, Loading, Tooltip } from '@calltouch/ct-ui-kit';
import {
  ColumnCustomizerNew as ColumnCustomizer,
  MetricModal,
  DimensionsNew as Dimensions,
  EditableTitle,
} from 'components';
import Filter from 'containers/Filter/Filter';

import styles from './Toolbar.module.scss';

// ======================================================
// Types
// ======================================================
import { ChartContext, MetricData } from '../../types/commonTypes';
import { MetricModalOriginal } from 'components/MetricModal/types';
import { FilterCondition } from 'ts-types/base-types';

interface Props {
  events?: {
    eventTogglerIsActive: boolean;
    addEventTogglerIsActive: boolean;
    onToggleEvents: (event: React.MouseEvent) => void;
    onAddEvent: (event: React.MouseEvent) => void;
  };
}

// ======================================================
// Static
// ======================================================
import { PAGES, CHART_TYPES } from 'consts';

const cn: Function = classnames.bind(styles);

function renderTrendBar(columnName: string): React.ReactNode {
  const conversionText = columnName ? `Конверсия в ${columnName.toLowerCase()}, %` : 'Конверсия, %';
  return (
    <div className={cn('TrendBar')}>
      <div className={cn('TrendBar__left')}>
        <span className={cn('TrendIcon', 'TrendIcon--conversion')} />
        <span className={cn('TrendName')}>{conversionText}</span>
      </div>
      <div className={cn('TrendBar__right')}>
        <span className={cn('TrendName')}>Сессии, доли</span>
        <span className={cn('TrendIcon', 'TrendIcon--session')} />
      </div>
    </div>
  );
}

// ======================================================
// Component
// ======================================================

const Toolbar: React.FunctionComponent<Props> = (props: Props) => {
  const context: ChartContext = useContext(DataContext);

  const isDashboard = useMemo(() => {
    return (
      context.pageId === PAGES.DASHBOARD_SETTINGS_EDIT ||
      context.pageId === PAGES.DASHBOARD_REPORT ||
      context.pageId === PAGES.DASHBOARD_SETTINGS_ADD ||
      document.location.href.indexOf('dashboard') !== -1
    );
  }, [context.pageId]);
  const isSiteList = useMemo(() => {
    return context.pageId === PAGES.SITE_LIST;
  }, [context.pageId]);
  const isPeriodComparison = useMemo(() => {
    return context.pageId === PAGES.ALL_SOURCES_COMPARISON;
  }, [context.pageId]);

  if (!context.metricData) {
    return (
      <div className={cn('Toolbar')}>
        <div className={cn('Toolbar__left')}>
          <Loading className={cn('Loading')} />
        </div>
      </div>
    );
  }

  function handleFilterApply(fields: Array<FilterCondition>): void {
    if (context.toolbarHandlers.onApplyFilter) {
      context.toolbarHandlers.onApplyFilter(fields);
    }
  }

  function renderStandard(): React.ReactElement {
    return (
      <>
        <div className={cn('Toolbar', 'ChartToolbar')}>
          <div className={cn('Toolbar__left')}>
            {context.chartName.length > 0 && (
              <>
                <div className={cn('Toolbar__item', 'Toolbar__name')}>
                  <EditableTitle
                    value={context.chartName}
                    color="brown"
                    disabled={!context.isTitleEditable}
                    onComplete={context.onCompleteTitleEdit}
                  />
                </div>
                <div className={cn('Toolbar__divider')} />
              </>
            )}
            {context.useCustomizer ? (
              <ColumnCustomizer
                id={`customizer_${context.componentId}`}
                metricData={context.metricData as MetricData}
                isLoadingAddSet={context.isLoadingAddSet}
                isLoadingSaveSet={context.isLoadingSaveSet}
                isNarrow
                maxMetrics={2}
                selectedMetrics={context.selectedMetrics}
                handlers={context.toolbarHandlers}
              />
            ) : (
              <MetricModal
                useIcon={isDashboard || isSiteList}
                metricData={context.metricData as MetricModalOriginal}
                selectedMetric={
                  context.selectedMetrics.length > 0 ? context.selectedMetrics[0] : undefined
                }
                onChangeMetric={context.toolbarHandlers.onChangeMetric}
                disableToolbarConversion={context.disableToolbarConversion}
              />
            )}
            {context.useDimensions && context.dimensions.length > 0 && (
              <>
                <div className={cn('Toolbar__divider')} />
                <Dimensions
                  id={generateId()}
                  dimensions={context.dimensions!}
                  color="blue"
                  onApply={context.toolbarHandlers.onApplyDimension}
                />
              </>
            )}
          </div>
          <div className={cn('Toolbar__right')}>
            {props.events && !isPeriodComparison && (
              <>
                <div className={cn('Events')}>
                  <Tooltip
                    content="Календарь событий"
                    className={cn('EventToggler__tooltip')}
                    direction="left"
                  >
                    <button
                      type="button"
                      className={cn('EventToggler', {
                        'EventToggler--active': props.events.eventTogglerIsActive,
                      })}
                      onClick={props.events.onToggleEvents}
                    >
                      <Icon
                        name="CalendarIcon"
                        viewBox="0 0 24 24"
                        color={props.events.eventTogglerIsActive ? '#ffffff' : '#24b0cb'}
                      />
                    </button>
                  </Tooltip>
                  <Tooltip
                    content="Добавить событие"
                    direction="left"
                    className={cn('EventToggler__tooltip')}
                  >
                    <button
                      type="button"
                      className={cn('EventToggler', {
                        'EventToggler--active': props.events.addEventTogglerIsActive,
                      })}
                      onClick={props.events.onAddEvent}
                    >
                      <Icon
                        name="AddEventIcon"
                        className={cn('AddEventIcon')}
                        viewBox="0 0 18 18"
                        color={props.events.addEventTogglerIsActive ? '#ffffff' : '#24b0cb'}
                      />
                    </button>
                  </Tooltip>
                </div>
                <div className={cn('Toolbar__divider')} />
              </>
            )}
            {context.hasPeriods && (
              <div className={cn('GroupTypes')}>
                <Tabs
                  tabList={context.periods}
                  activeTab={context.currentPeriod}
                  onChange={context.toolbarHandlers.onChangePeriod}
                />
              </div>
            )}
            {context.useOwnFilter && context.filterOptions && (
              <Filter
                isDashboard
                onlyIcon
                reducerId={context.filterOptions.reducerId}
                reportId={context.filterOptions.filterReportId}
                isFetching={context.settingsLoading || context.dataLoading}
                onApply={handleFilterApply}
              />
            )}
            {context.canHide && (
              <>
                <div className={cn('Toolbar__divider')} />
                <button
                  type="button"
                  className={cn('ChartToggler', {
                    'ChartToggler--opened': !context.chartIsHidden,
                  })}
                  onClick={context.onToggleChart}
                >
                  <Tooltip
                    content={context.chartIsHidden ? 'Показать график' : 'Скрыть график'}
                    direction="left"
                  >
                    <Icon name="ArrowDownIcon" color="#746a5d" />
                  </Tooltip>
                </button>
              </>
            )}
          </div>
        </div>
        {context.chartType === 'trend' && renderTrendBar(context.chartData[0]?.columnName || '')}
      </>
    );
  }

  function renderDashboard(): React.ReactElement {
    return (
      <div
        className={cn('Toolbar', 'Toolbar--dashboard', 'ChartToolbar', {
          'Toolbar--dashboard-linear': context.chartType === CHART_TYPES.LINEAR_CHART,
        })}
      >
        <div className={cn('Toolbar__row', 'Toolbar__row--stretched')}>
          <div className={cn('Toolbar__left')}>
            <div className={cn('Toolbar__item', 'Toolbar__name')}>
              <EditableTitle
                value={context.chartName}
                color="brown"
                disabled={!context.isTitleEditable}
                onComplete={context.onCompleteTitleEdit as any}
              />
            </div>
          </div>
          <div className={cn('Toolbar__right')}>
            {context.hasPeriods && (
              <div className={cn('GroupTypes')}>
                <Tabs
                  tabList={context.periods}
                  activeTab={context.currentPeriod}
                  onChange={context.toolbarHandlers.onChangePeriod}
                />
              </div>
            )}
            {context.useOwnFilter && context.filterOptions && (
              <Filter
                isDashboard
                onlyIcon
                reducerId={context.filterOptions.reducerId}
                reportId={context.filterOptions.filterReportId}
                isFetching={context.settingsLoading || context.dataLoading}
                externalFilter={isDashboard}
                filterFromSettings={context.filterOptions.currentFilter}
                onApply={handleFilterApply}
              />
            )}
          </div>
        </div>
        <div className={cn('Toolbar__row', { 'Toolbar__row--margined': context.hasPeriods })}>
          <div className={cn('Popover')}>
            {context.chartType === CHART_TYPES.LINEAR_CHART ? (
              <ColumnCustomizer
                id={`customizer_${context.componentId}`}
                metricData={context.metricData as MetricData}
                isLoadingAddSet={context.isLoadingAddSet}
                isLoadingSaveSet={context.isLoadingSaveSet}
                maxMetrics={2}
                isNarrow
                selectedMetrics={context.selectedMetrics}
                handlers={context.toolbarHandlers}
              />
            ) : (
              <MetricModal
                useIcon={isDashboard}
                metricData={context.metricData as MetricModalOriginal}
                selectedMetric={
                  context.selectedMetrics.length > 0 ? context.selectedMetrics[0] : undefined
                }
                onChangeMetric={context.toolbarHandlers.onChangeMetric}
                disableToolbarConversion={context.disableToolbarConversion}
              />
            )}
          </div>
          {context.useDimensions && context.dimensions.length > 0 && (
            <div className={cn('Dimensions')}>
              <Dimensions
                id={generateId()}
                dimensions={context.dimensions!}
                onApply={context.toolbarHandlers.onApplyDimension}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (context.canHide && context.chartIsHidden) {
    return (
      <div className={cn('Toolbar', 'ChartToolbar')}>
        <div className={cn('Toolbar__left')}>
          {context.chartName.length > 0 && (
            <>
              <div className={cn('Toolbar__item', 'Toolbar__name')}>
                <EditableTitle
                  value={`График «${context.chartName}»`}
                  color="brown"
                  disabled={!context.isTitleEditable}
                  onComplete={context.onCompleteTitleEdit}
                />
              </div>
            </>
          )}
        </div>
        <div className={cn('Toolbar__right')}>
          <button
            type="button"
            className={cn('ChartToggler', {
              'ChartToggler--opened': !context.chartIsHidden,
            })}
            onClick={context.onToggleChart}
          >
            <Tooltip
              content={context.chartIsHidden ? 'Показать график' : 'Скрыть график'}
              direction="left"
            >
              <Icon name="ArrowDownIcon" color="#746a5d" />
            </Tooltip>
          </button>
        </div>
      </div>
    );
  }

  return isDashboard ? renderDashboard() : renderStandard();
};

export default Toolbar;
