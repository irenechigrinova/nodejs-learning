import React, { useEffect, useReducer, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classnames from 'classnames/bind';
import moment from 'moment';
import { isEqual } from 'lodash';

// ======================================================
// Helpers and utils
// ======================================================
import usePrevious from 'hooks/usePrevious';
import { isLoadedHandler } from 'helpers/handlers';
import { SYSTEM_FORMAT, FORMAT, FULL_SYSTEM_FORMAT } from 'helpers/date-helper';
import { emptyFunction } from 'utils/common';
import Notification from 'helpers/notification';

// ======================================================
// Redux and api
// ======================================================
import { getBindActions, getState } from './event-reducer';
import * as api from './api-event';

// ======================================================
// Components and css
// ======================================================
import { Input, Loading, Icon, FormButtons } from '@calltouch/ct-ui-kit';
import { Error, TimePeriods } from 'components';

import styles from './Event.module.scss';
// ======================================================
// Static
// ======================================================
import { EVENT_COLORS } from '../../helpers/consts';

const cn = classnames.bind(styles);

const userIcon = <Icon name="UserIcon" color="#24b0cb" />;

function reducer(state: State, action: any): State {
  if (action.type === 'change') {
    return {
      ...state,
      ...action.payload,
    };
  }
  throw new Error('Reducer Error');
}

// ======================================================
// Types
// ======================================================
import { DataStatuses } from 'ts-types/status-types';

import { EventData } from '../../types/commonTypes';

interface Props {
  eventId: number | null;
  data: EventData;

  getDataStatuses: DataStatuses;
  saveEventStatuses: DataStatuses;
  deleteEventStatuses: DataStatuses;

  actionGetData: Function;
  actionSaveEvent: Function;
  actionDeleteEvent: Function;
  actionResetData: Function;

  onCreateEvent: (event: EventData) => void;
  onUpdateEvent: (event: EventData) => void;
  onDeleteEvent: (eventId: number) => void;
  onChangeEvent: (hasChanges: boolean) => void;
  onCancel: () => void;
}

interface State {
  name: string;
  description: string;
  color: string;
  dateFrom: string;
  dateTo: string;
}

// ======================================================
// Component
// ======================================================
const Event: React.FunctionComponent<Props> = (props: Props) => {
  const initialState = useRef<State>({
    name: props.data.name,
    description: props.data.description,
    color: props.data.color,
    dateFrom: props.data.dateFrom,
    dateTo: props.data.dateTo,
  });
  const [state, dispatch] = useReducer(reducer, initialState.current);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const prevGetDataStatuses = usePrevious(props.getDataStatuses);
  const prevSaveEventStatuses = usePrevious(props.saveEventStatuses);
  const prevDeleteEventStatuses = usePrevious(props.deleteEventStatuses);

  useEffect(() => {
    if (props.eventId) {
      props.actionGetData(props.eventId);
    }
    return () => {
      props.actionResetData();
    };
  }, []);

  useEffect(() => {
    if (prevGetDataStatuses && isLoadedHandler(prevGetDataStatuses, props.getDataStatuses)) {
      const payload = {
        name: props.data.name,
        description: props.data.description,
        color: props.data.color,
        dateFrom: props.data.dateFrom,
        dateTo: props.data.dateTo,
      };
      initialState.current = payload;
      dispatch({
        type: 'change',
        payload,
      });
    }
  }, [props.getDataStatuses]);

  useEffect(() => {
    if (prevSaveEventStatuses && isLoadedHandler(prevSaveEventStatuses, props.saveEventStatuses)) {
      initialState.current = state;
      setHasChanges(false);
      props.onChangeEvent(false);
      Notification.flash(props.eventId ? 'Событие успешно сохранено' : 'Событие успешно создано');
      if (!props.eventId) {
        props.onCreateEvent(props.data);
      } else {
        props.onUpdateEvent(props.data);
      }
    }
  }, [props.saveEventStatuses]);

  useEffect(() => {
    if (
      prevDeleteEventStatuses &&
      isLoadedHandler(prevDeleteEventStatuses, props.deleteEventStatuses)
    ) {
      Notification.flash('Событие успешно удалено');
      props.onDeleteEvent(props.data.id as number);
    }
  }, [props.deleteEventStatuses]);

  useEffect(() => {
    const isChanged = !isEqual(state, initialState.current);
    setHasChanges(isChanged);
    props.onChangeEvent(isChanged);
  }, [state]);

  function handleInputChange(value: string, field: string): void {
    dispatch({
      type: 'change',
      payload: {
        [field]: value,
      },
    });
  }

  function handleChangePeriod({ period }): void {
    dispatch({
      type: 'change',
      payload: {
        dateFrom: period.start.format(FULL_SYSTEM_FORMAT),
        dateTo: period.end.format(FULL_SYSTEM_FORMAT),
      },
    });
  }

  function handleSave(): void {
    props.actionSaveEvent(props.eventId, state);
  }

  function handleDelete(): void {
    Notification.notify(
      'Вы уверены, что хотите удалить событие? Удаление события полностью сотрет его с графиков.',
      {
        onApply: props.actionDeleteEvent.bind(null, props.eventId),
        onApplyText: 'Да',
        onCancel: () => {},
        onCancelText: 'Нет',
      },
    );
  }

  function handleColorClick(color: string, isAllowedEdit): void {
    if (isAllowedEdit) {
      dispatch({
        type: 'change',
        payload: {
          color,
        },
      });
    }
  }

  function renderLoading(): React.ReactElement {
    return (
      <div className={cn('Event')}>
        <Loading className={cn('Loading')} />
      </div>
    );
  }

  function renderError(): React.ReactElement {
    return (
      <div className={cn('Event')}>
        <Error
          errorTitle={props.getDataStatuses.errorTitle || 'Ошибка сервера'}
          errorMessage={props.getDataStatuses.errorMessage || 'Попробуйте перезагрузить страницу'}
        />
      </div>
    );
  }

  function renderEvent(): React.ReactElement {
    return (
      <div className={cn('Event')}>
        <h3 className={cn('Title')}>
          {props.eventId ? 'Редактировать событие' : 'Создать событие'}
        </h3>
        <div className={cn('Field')}>
          <Input
            text="Название"
            value={state.name}
            maxLength={40}
            showRemainedSymbols
            disabled={!props.data.isAllowEdit}
            onChange={handleInputChange}
            params="name"
          />
        </div>
        <div className={cn('Field')}>
          <Input
            text="Описание"
            value={state.description}
            maxLength={150}
            showRemainedSymbols
            isTextarea
            disabled={!props.data.isAllowEdit}
            onChange={handleInputChange}
            params="description"
          />
        </div>
        <div className={cn('Field', 'Field--date')}>
          <span className={cn('Label')}>Дата</span>
          <TimePeriods
            pageId=""
            getPeriods={false}
            period={{
              id: 'EventPeriod',
              periods: [
                {
                  start: moment(state.dateFrom, FULL_SYSTEM_FORMAT),
                  end: moment(state.dateTo, FULL_SYSTEM_FORMAT),
                  min: null,
                  max: null,
                },
              ],
            }}
            isDisabled={!props.data.isAllowEdit}
            actionGetPeriods={emptyFunction}
            actionAddPeriod={emptyFunction}
            actionUpdatePeriod={handleChangePeriod}
            actionDeletePeriod={emptyFunction}
          />
        </div>
        <div
          className={cn('Field', 'Field--colors', {
            'Field--colors-margined': props.data.partyName.length === 0,
          })}
        >
          <span className={cn('Label')}>Цветовая метка</span>
          <div className={cn('Colors')}>
            {EVENT_COLORS.map(color => (
              <div
                key={color}
                className={cn('ColorWrapper', {
                  'ColorWrapper--disabled': !props.data.isAllowEdit,
                })}
                style={{
                  border: color === state.color ? `1px solid #${color}` : '1px solid transparent',
                }}
                role="presentation"
                onClick={() => {
                  handleColorClick(color, props.data.isAllowEdit);
                }}
              >
                <div className={cn('Color')} style={{ backgroundColor: `#${color}` }} />
              </div>
            ))}
          </div>
        </div>
        {props.data.partyName.length > 0 && (
          <div className={cn('Field', 'Field--user')}>
            <span className={cn('Label')}>Создатель события</span>
            <div className={cn('User')}>
              <span className={cn('User__icon')}>{userIcon}</span>
              <span className={cn('User__name')}>{props.data.partyName}</span>
            </div>
          </div>
        )}
        {props.data.isAllowEdit && (
          <FormButtons
            showSave
            saveText={props.eventId ? 'Сохранить' : 'Создать'}
            disableSaveButton={!hasChanges || state.name.length === 0}
            saveCallback={handleSave}
            showCancel
            cancelText="Отменить"
            cancelCallback={props.onCancel}
            showNext={!!props.eventId}
            nextIconName="TrashIcon"
            nextText="Удалить"
            nextColor="red"
            nextCallback={handleDelete}
            useShadow
            big
            sticky
            isLoading={props.saveEventStatuses.isFetching || props.deleteEventStatuses.isFetching}
          />
        )}
      </div>
    );
  }

  if (props.eventId && props.getDataStatuses.isFetching) {
    return renderLoading();
  }

  if (props.getDataStatuses.isFailed) {
    return renderError();
  }

  return renderEvent();
};

const mapStateToProps = state => ({ ...getState(state) });

const mapDispatchToProps = (dispatch, ownProps: Props) => {
  return {
    ...bindActionCreators(
      {
        ...getBindActions(api),
      },
      dispatch,
    ),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Event);
