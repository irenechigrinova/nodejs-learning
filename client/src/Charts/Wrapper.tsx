import { useState } from "react";
import DataContext, { contextDefaultValues } from "./context/DataContext";
import ChartLayout from "./layouts/ChartLayout";

const Wrapper = (props: any) => {
  const [state] = useState({
    ...contextDefaultValues,
    toolbarHandlers: {
      onApplyCustomizer: () => {},
      onDeleteSet: () => {},
      onUpdateSet: () => {},
      onCreateSet: () => {},
      onChangeMetric: () => {},
    },
    isLoadingAddSet: false,
    isLoadingSaveSet: false,
  });
  return (
    <DataContext.Provider
      value={{
        ...state,
        chartData: props.chartData,
        onlyOneYear: true,
        offsetHeight: undefined,
        legendDataByDate: undefined,
        periods: [
          { value: "hour", text: "Часы", disabled: false },
          { value: "day", text: "Дни", disabled: false },
          { value: "week", text: "Недели", disabled: false },
          { value: "month", text: "Месяцы", disabled: false },
        ],
        currentPeriod: "day",
        selectedMetrics: [],
        dataLoading: false,
        settingsLoading: false,
        chartName: "График",
        toolbarHandlers: {
          onApplyCustomizer: () => {},
          onDeleteSet: () => {},
          onUpdateSet: () => {},
          onCreateSet: () => {},
          onChangeMetric: () => {},
          onChangePeriod: () => {},
          onApplyDimension: () => {},
          onApplyFilter: () => {},
        },
        onUpdateEvents: () => {},
        onToggleChart: () => {},
        onToggleEvents: () => {},
        onCompleteTitleEdit: () => {},
      }}
    >
      <ChartLayout />
    </DataContext.Provider>
  );
};

export default Wrapper;
