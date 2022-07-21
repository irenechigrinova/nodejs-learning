import { createGenericReducer } from 'app-redux/modules/helpers';
import moment from 'moment';

import { EVENT_COLORS } from '../../helpers/consts';
import { SYSTEM_FORMAT } from 'helpers/date-helper';

const today = moment().format(SYSTEM_FORMAT);

const DEFAULT_EVENT = {
  id: null,
  name: '',
  description: '',
  color: EVENT_COLORS[0],
  dateFrom: today,
  dateTo: today,
  partyName: '',
  isAllowEdit: true,
};

const {
  id: _id,
  getState: _getState,
  getInitialState: _getInitialState,
  actions: _actions,
  getBindActions: _getBindActions,
  reducer,
} = createGenericReducer('REPORT__ChartEvent', {
  getData: {
    type: 'api',
    initialState: {
      data: DEFAULT_EVENT,
    },
    reducer: (state, action, data) => ({
      ...state,
      data,
    }),
  },
  saveEvent: {
    type: 'api',
    reducer: (state, action, data) => ({
      ...state,
      data,
    }),
  },
  deleteEvent: {
    type: 'api',
  },
  resetData: {
    type: 'simple',
    reducer: (state, action) => ({
      ...state,
      data: DEFAULT_EVENT,
    }),
  },
});

export const id = _id;
export const getState = _getState;
export const getInitialState = _getInitialState;
export const getBindActions = _getBindActions;
export const actions = _actions;
export default reducer;
