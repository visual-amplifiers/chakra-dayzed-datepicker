import {
  HStack,
  VStack,
  Heading,
  Divider,
  SimpleGrid,
  Box,
  Stack,
  Flex,
  Select,
} from '@chakra-ui/react';
import { useDayzed, Props as DayzedHookProps } from 'dayzed';
import { ArrowKeysReact } from '../utils/reactKeysArrow';
import React, { useCallback, useMemo } from 'react';
import { CalendarConfigs, DatepickerProps } from '../utils/commonTypes';
import { DatepickerBackBtns, DatepickerForwardBtns } from './dateNavBtns';
import { DayOfMonth } from './dayOfMonth';

export interface CalendarPanelProps extends DatepickerProps {
  dayzedHookProps: Omit<DayzedHookProps, 'children' | 'render'>;
  configs: CalendarConfigs;
  disabledDates?: Set<number>;
  onMouseEnterHighlight?: (date: Date) => void;
  isInRange?: (date: Date) => boolean | null;
  handleMonthChange?: (ev: React.ChangeEvent<HTMLSelectElement>) => void;
  handleYearChange?: (ev: React.ChangeEvent<HTMLSelectElement>) => void;
  showYearMonthPicker?: boolean;
}

export const CalendarPanel: React.FC<CalendarPanelProps> = ({
  dayzedHookProps,
  configs,
  propsConfigs,
  disabledDates,
  onMouseEnterHighlight,
  isInRange,
  showYearMonthPicker,
  handleMonthChange,
  handleYearChange,
}) => {
  const renderProps = useDayzed(dayzedHookProps);
  const { calendars, getBackProps, getForwardProps } = renderProps;

  const weekdayNames = useMemo(() => {
    const firstDayOfWeek = configs.firstDayOfWeek;
    const dayNames = configs.dayNames;
    if (firstDayOfWeek && firstDayOfWeek > 0) {
      return configs.dayNames
        .slice(firstDayOfWeek, dayNames.length)
        .concat(dayNames.slice(0, firstDayOfWeek));
    }
    return dayNames;
  }, [configs.firstDayOfWeek, configs.dayNames]);

  // looking for a useRef() approach to replace it
  const getKeyOffset = useCallback((num: number) => {
    const e = document.activeElement;
    let buttons = document.querySelectorAll('button');
    buttons.forEach((el, i) => {
      const newNodeKey = i + num;
      if (el === e) {
        if (newNodeKey <= buttons.length - 1 && newNodeKey >= 0) {
          buttons[newNodeKey].focus();
        } else {
          buttons[0].focus();
        }
      }
    });
  }, []);

  const arrowKeysReact = new ArrowKeysReact({
    left: () => {
      getKeyOffset(-1);
    },
    right: () => {
      getKeyOffset(1);
    },
    up: () => {
      getKeyOffset(-7);
    },
    down: () => {
      getKeyOffset(7);
    },
  });

  if (calendars.length <= 0) {
    return null;
  }

  return (
    <Stack
      className="datepicker-calendar"
      direction={['column', 'column', 'row']}
      {...propsConfigs?.calendarPanelProps?.wrapperProps}
      {...arrowKeysReact.getEvents()}
    >
      {calendars.map((calendar, calendarIdx) => {
        return (
          <VStack
            key={calendarIdx}
            height="100%"
            borderWidth="1px"
            padding="0.5rem 0.75rem"
            {...propsConfigs?.calendarPanelProps?.contentProps}
          >
            <HStack {...propsConfigs?.calendarPanelProps?.headerProps}>
              <DatepickerBackBtns
                calendars={calendars}
                getBackProps={getBackProps}
                propsConfigs={propsConfigs}
              />
              {showYearMonthPicker ? (
                <Flex flexDir="row">
                  <Select
                    onChange={handleMonthChange}
                    // Resolves safari issue whereby onChange triggers blur event closing the
                    // popover.
                    onBlur={(e) => e.preventDefault()}
                    {...propsConfigs?.monthSelectProps}
                    value={calendar.month}
                  >
                    {configs.monthNames.map((month, idx) => (
                      <option key={idx} value={idx}>
                        {month}
                      </option>
                    ))}
                  </Select>
                  <Select
                    onChange={handleYearChange}
                    // Resolves safari issue whereby onChange triggers blur event closing the
                    // popover.
                    onBlur={(e) => e.preventDefault()}
                    {...propsConfigs?.yearSelectProps}
                    value={calendar.year}
                  >
                    {configs.years.map((year, idx) => (
                      <option key={idx} value={year}>
                        {year}
                      </option>
                    ))}
                  </Select>
                </Flex>
              ) : (
                <Heading
                  size="sm"
                  minWidth={'5rem'}
                  textAlign="center"
                  {...propsConfigs?.dateHeadingProps}
                >
                  {configs.monthNames[calendar.month]} {calendar.year}
                </Heading>
              )}
              <DatepickerForwardBtns
                calendars={calendars}
                getForwardProps={getForwardProps}
                propsConfigs={propsConfigs}
              />
            </HStack>
            <Divider {...propsConfigs?.calendarPanelProps?.dividerProps} />
            <SimpleGrid
              columns={7}
              spacing={1}
              textAlign="center"
              {...propsConfigs?.calendarPanelProps?.bodyProps}
            >
              {weekdayNames.map((day, dayIdx) => (
                <Box
                  fontSize="sm"
                  fontWeight="semibold"
                  key={dayIdx}
                  {...propsConfigs?.weekdayLabelProps}
                >
                  {day}
                </Box>
              ))}
              {calendar.weeks.map((week, weekIdx) => {
                return week.map((dateObj, index) => {
                  const key = `${calendar.month}-${calendar.year}-${weekIdx}-${index}`;
                  if (!dateObj) return <Box key={key} />;
                  const { date } = dateObj;
                  return (
                    <DayOfMonth
                      key={key}
                      dateObj={dateObj}
                      propsConfigs={propsConfigs}
                      renderProps={renderProps}
                      isInRange={isInRange && isInRange(date)}
                      disabledDates={disabledDates}
                      onMouseEnter={() => {
                        if (onMouseEnterHighlight) onMouseEnterHighlight(date);
                      }}
                    />
                  );
                });
              })}
            </SimpleGrid>
          </VStack>
        );
      })}
    </Stack>
  );
};
