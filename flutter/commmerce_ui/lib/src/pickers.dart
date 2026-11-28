import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'button.dart';
import 'display.dart';
import 'forms.dart';
import 'generated/icons.g.dart';
import 'generated/tokens.g.dart';
import 'icon.dart';
import 'strings.dart';
import 'theme.dart';

/// Material date picker colours from Commmerce tokens: black selection, `bgAttentionSoft` range band,
/// dark panel header. [CmTheme.light] and [CmTheme.dark] already include it; the pickers also apply it themselves.
DatePickerThemeData cmDatePickerTheme(CmColors c) => DatePickerThemeData(
  backgroundColor: c.bgSurface,
  surfaceTintColor: Colors.transparent,
  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(CmRadius.md)),
  headerBackgroundColor: c.bgPanelHeader,
  headerForegroundColor: c.textOnDark,
  headerHeadlineStyle: CmType.headingSm.copyWith(color: c.textOnDark),
  headerHelpStyle: CmType.bodySm.copyWith(color: c.textOnDark),
  weekdayStyle: CmType.bodySm.copyWith(color: c.textTertiary),
  dayStyle: CmType.bodyMd,
  dayForegroundColor: WidgetStateProperty.resolveWith(
    (s) => s.contains(WidgetState.disabled)
        ? c.textSecondary
        : s.contains(WidgetState.selected)
        ? c.actionPrimaryText
        : c.textDefault,
  ),
  dayBackgroundColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? c.actionPrimary : null),
  dayShape: WidgetStatePropertyAll(RoundedRectangleBorder(borderRadius: BorderRadius.circular(CmRadius.sm))),
  todayForegroundColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? c.actionPrimaryText : c.textDefault),
  todayBackgroundColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? c.actionPrimary : null),
  todayBorder: BorderSide(color: c.borderStrong),
  yearForegroundColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? c.actionPrimaryText : c.textDefault),
  yearBackgroundColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? c.actionPrimary : null),
  rangePickerBackgroundColor: c.bgSurface,
  rangePickerHeaderBackgroundColor: c.bgPanelHeader,
  rangePickerHeaderForegroundColor: c.textOnDark,
  rangeSelectionBackgroundColor: c.bgAttentionSoft,
  dividerColor: c.borderSubtle,
  cancelButtonStyle: TextButton.styleFrom(foregroundColor: c.textDefault),
  confirmButtonStyle: TextButton.styleFrom(foregroundColor: c.textDefault),
);

Widget _themed(BuildContext context, Widget? child) {
  final c = CmTheme.colorsOf(context);
  return Theme(
    data: Theme.of(context).copyWith(datePickerTheme: cmDatePickerTheme(c)),
    child: child!,
  );
}

/// The read-only box both date pickers show: the formatted value (or placeholder) and a calendar icon.
/// Tap, Enter or Space opens the picker; it is announced as a button with the label and the value.
class _DateBox extends StatelessWidget {
  const _DateBox({
    required this.label,
    required this.text,
    this.placeholder,
    required this.onOpen,
    this.helpText,
    this.error,
    this.required = false,
    this.semanticValue,
    this.side,
    this.content,
    this.icon,
  });
  final String label;
  final String? text, placeholder, helpText, error, semanticValue;
  final VoidCallback? onOpen;
  final bool required;

  /// Shown next to the box (the time box of a [CmDatePicker] with `time`).
  final Widget? side;

  /// Shown in the box instead of [text] (the report field of a [CmDateRangePicker]).
  final Widget? content;

  /// The icon at the end of the box. Default: the calendar.
  final String? icon;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final enabled = onOpen != null;
    final hasError = error != null && error!.isNotEmpty;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        ExcludeSemantics(
          child: Text.rich(
            TextSpan(
              children: [
                TextSpan(
                  text: label,
                  style: CmText.of(context).label.copyWith(color: c.textDefault),
                ),
                if (required)
                  TextSpan(
                    text: ' *',
                    style: TextStyle(color: c.textCritical),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: CmSpace.s8),
        if (side == null) _box(context, c, enabled, hasError) else Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Expanded(child: _box(context, c, enabled, hasError)),
          const SizedBox(width: CmSpace.s8),
          side!,
        ]),
      ],
    );
  }

  Widget _box(BuildContext context, CmColors c, bool enabled, bool hasError) {
    return Semantics(
          button: true,
          enabled: enabled,
          label: '$label${required ? CmStrings.of(context).requiredSuffix : ''}',
          value: semanticValue ?? (text ?? CmStrings.of(context).notSet),
          hint: hasError ? error : helpText,
          excludeSemantics: true,
          onTap: onOpen,
          child: InkWell(
            onTap: onOpen,
            borderRadius: BorderRadius.circular(CmRadius.sm),
            child: InputDecorator(
              isEmpty: content == null && text == null,
              decoration: InputDecoration(
                enabled: enabled,
                isDense: true,
                hintText: placeholder,
                constraints: BoxConstraints(minHeight: cmFieldHeight(context)),
                contentPadding: cmFieldPadding(cmFieldHeight(context)),
                fillColor: enabled ? c.bgSurface : c.bgInputFilled,
                suffixIcon: Padding(
                  padding: const EdgeInsets.only(right: 4),
                  child: CmIcon(icon ?? CmIcons.calendar, size: icon == null ? 18 : 16, color: enabled ? c.iconSelected : c.textSecondary),
                ),
                suffixIconConstraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                errorText: hasError ? error : null,
                errorStyle: CmType.bodyXs.copyWith(color: c.textCritical),
                helperText: hasError ? null : helpText,
                helperStyle: CmType.bodyXs.copyWith(color: c.textTertiary),
                helperMaxLines: 3,
              ),
              child: content ?? Text(text ?? '', style: cmFieldText(context).copyWith(color: enabled ? c.textDefault : c.textSecondary)),
            ),
          ),
        );
  }
}

/// The time box of a [CmDatePicker] with `time`: the time in the locale's clock, or the hh:mm pattern.
class _TimeBox extends StatelessWidget {
  const _TimeBox({required this.name, required this.text, required this.placeholder, required this.onOpen, this.required = false});
  final String name, placeholder;
  final String? text;
  final VoidCallback? onOpen;
  final bool required;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final enabled = onOpen != null;
    return SizedBox(
      width: 150,
      child: Semantics(
        button: true,
        enabled: enabled,
        label: '$name${required ? CmStrings.of(context).requiredSuffix : ''}',
        value: text ?? CmStrings.of(context).notSet,
        excludeSemantics: true,
        onTap: onOpen,
        child: InkWell(
          onTap: onOpen,
          borderRadius: BorderRadius.circular(CmRadius.sm),
          child: InputDecorator(
            isEmpty: text == null,
            decoration: InputDecoration(
              enabled: enabled,
              isDense: true,
              hintText: placeholder,
              constraints: BoxConstraints(minHeight: cmFieldHeight(context)),
                contentPadding: cmFieldPadding(cmFieldHeight(context)),
              fillColor: enabled ? c.bgSurface : c.bgInputFilled,
              suffixIcon: Padding(
                padding: const EdgeInsetsDirectional.only(end: 4),
                child: CmIcon(CmIcons.clock, size: 18, color: enabled ? c.iconSelected : c.textSecondary),
              ),
              suffixIconConstraints: const BoxConstraints(minWidth: 32, minHeight: 32),
            ),
            child: Text(text ?? '', maxLines: 1, style: cmFieldText(context).copyWith(color: enabled ? c.textDefault : c.textSecondary)),
          ),
        ),
      ),
    );
  }
}

/// A date field that opens the Material date picker, themed with Commmerce tokens. Mirrors `<cm-date-picker>`.
/// The picker has a calendar and a typed-entry mode (the pencil button); month and weekday names follow the
/// app's `Localizations` (or [locale]).
class CmDatePicker extends StatelessWidget {
  const CmDatePicker({
    super.key,
    required this.label,
    required this.value,
    required this.onChanged,
    required this.firstDate,
    required this.lastDate,
    this.selectableDayPredicate,
    this.helpText,
    this.error,
    this.placeholder,
    this.required = false,
    this.locale,
    this.initialEntryMode = DatePickerEntryMode.calendar,
    this.time = false,
    this.step = 1,
    this.minNow = false,
    this.use24HourFormat,
  });

  final String label;

  /// The chosen date (time ignored); null when none. With [time]: the local date and time.
  final DateTime? value;

  /// Adds a time box next to the date box, so the field holds a date and a time (a local [DateTime]). The time is
  /// shown in the locale's clock (12-hour with am/pm for en-IN) and chosen with the Material time picker.
  /// Choosing a date with no time set yet opens the time picker next. Since 1.2 (web: `time`).
  final bool time;

  /// With [time]: minutes between allowed times, counted from midnight (15 allows :00, :15, :30, :45). A picked
  /// time is moved to the nearest step. Default 1.
  final int step;

  /// With [time]: the earliest choice is now (the current minute, checked whenever a time is picked), or
  /// [firstDate] when that is later. With [time], [firstDate] and [lastDate] may include a time of day.
  final bool minNow;

  /// With [time]: force a 24-hour (true) or 12-hour (false) clock. Null: the locale's and platform's clock.
  final bool? use24HourFormat;

  /// Called with the picked date. Null disables the field.
  final ValueChanged<DateTime>? onChanged;

  /// Earliest and latest dates that can be chosen (like `min` and `max` on the web).
  final DateTime firstDate, lastDate;

  /// Return false for dates that can't be chosen (holidays, Sundays).
  final SelectableDayPredicate? selectableDayPredicate;
  final String? helpText, error;
  /// Shown while empty. Default: [CmStrings.chooseDate] / [CmStrings.chooseDates].
  final String? placeholder;
  final bool required;

  /// Language of the picker; defaults to the app's locale.
  final Locale? locale;

  /// Start in the calendar or in typed entry.
  final DatePickerEntryMode initialEntryMode;

  int get _step => step >= 1 && step <= 1440 ? step : 1;

  /// The earliest allowed moment: [firstDate], or now when [minNow] and later.
  DateTime get _min {
    if (!(time && minNow)) return firstDate;
    final n = DateTime.now();
    final now = DateTime(n.year, n.month, n.day, n.hour, n.minute);
    return now.isAfter(firstDate) ? now : firstDate;
  }

  /// [at] moved onto the step and inside the limits.
  DateTime _fit(DateTime at) {
    final st = _step;
    final day = DateUtils.dateOnly(at);
    var minutes = at.hour * 60 + at.minute;
    minutes = ((minutes / st).round() * st).clamp(0, (1439 ~/ st) * st);
    var r = day.add(Duration(minutes: minutes));
    final min = _min;
    // A time that is not a whole minute (the limits may carry seconds) rounds up onto the next step.
    if (r.isBefore(min)) {
      final m = DateUtils.dateOnly(min);
      final mm = min.hour * 60 + min.minute + (min.second > 0 || min.millisecond > 0 ? 1 : 0);
      r = m.add(Duration(minutes: ((mm + st - 1) ~/ st) * st));
    }
    // A last date without a time of day allows the whole of that day.
    final max = lastDate.hour == 0 && lastDate.minute == 0 ? DateUtils.dateOnly(lastDate).add(const Duration(minutes: 1439)) : lastDate;
    if (r.isAfter(max)) {
      final mm = max.hour * 60 + max.minute;
      r = DateUtils.dateOnly(max).add(Duration(minutes: (mm ~/ st) * st));
    }
    return r;
  }

  Future<void> _openTime(BuildContext context, DateTime date) async {
    final min = _min;
    final start = value != null
        ? TimeOfDay.fromDateTime(value!)
        : DateUtils.isSameDay(date, min) && min.isAfter(DateTime(date.year, date.month, date.day))
            ? TimeOfDay.fromDateTime(_fit(min))
            : TimeOfDay.fromDateTime(_fit(DateTime.now()));
    final use24 = use24HourFormat ?? MediaQuery.alwaysUse24HourFormatOf(context);
    final picked = await showTimePicker(
      context: context,
      initialTime: start,
      helpText: CmStrings.of(context).timeFor(label),
      builder: (context, child) => MediaQuery(
        data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: use24),
        child: _themed(context, child),
      ),
    );
    if (picked == null) return;
    onChanged?.call(_fit(DateTime(date.year, date.month, date.day, picked.hour, picked.minute)));
  }

  Future<void> _open(BuildContext context) async {
    final now = DateUtils.dateOnly(DateTime.now());
    final firstDate = DateUtils.dateOnly(_min);
    final lastDate = DateUtils.dateOnly(this.lastDate);
    var initial = value == null ? now : DateUtils.dateOnly(value!);
    if (initial.isBefore(firstDate)) initial = firstDate;
    if (initial.isAfter(lastDate)) initial = lastDate;
    if (selectableDayPredicate != null && !selectableDayPredicate!(initial)) {
      // showDatePicker asserts that the initial date is selectable: start on the first selectable day after it.
      var d = initial;
      while (!d.isAfter(lastDate) && !selectableDayPredicate!(d)) {
        d = d.add(const Duration(days: 1));
      }
      initial = d.isAfter(lastDate) ? initial : d;
    }
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: firstDate,
      lastDate: lastDate,
      currentDate: now,
      selectableDayPredicate: selectableDayPredicate,
      helpText: label,
      locale: locale,
      initialEntryMode: initialEntryMode,
      builder: _themed,
    );
    if (picked == null) return;
    if (!time) {
      onChanged?.call(DateUtils.dateOnly(picked));
    } else if (value != null) {
      // Keep the time of day; move it inside the limits if the new day needs it.
      onChanged?.call(_fit(DateTime(picked.year, picked.month, picked.day, value!.hour, value!.minute)));
    } else if (context.mounted) {
      await _openTime(context, picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = MaterialLocalizations.of(context);
    final s = CmStrings.of(context);
    Widget? side;
    if (time) {
      final use24 = use24HourFormat ?? MediaQuery.alwaysUse24HourFormatOf(context);
      final twelve = !use24 && l.timeOfDayFormat(alwaysUse24HourFormat: false) != TimeOfDayFormat.HH_colon_mm && l.timeOfDayFormat(alwaysUse24HourFormat: false) != TimeOfDayFormat.frenchCanadian;
      side = _TimeBox(
        name: label.isEmpty ? s.time : s.timeFor(label),
        text: value == null ? null : l.formatTimeOfDay(TimeOfDay.fromDateTime(value!), alwaysUse24HourFormat: use24),
        placeholder: '${s.patternHour}:${s.patternMinute}${twelve ? ' ${s.am}' : ''}',
        required: required,
        onOpen: onChanged == null
            ? null
            : () {
                final today = DateUtils.dateOnly(DateTime.now());
                final min = DateUtils.dateOnly(_min);
                final day = value ?? (today.isBefore(min) ? min : today.isAfter(lastDate) ? DateUtils.dateOnly(lastDate) : today);
                _openTime(context, day);
              },
      );
    }
    return _DateBox(
      label: label,
      text: value == null ? null : l.formatShortDate(value!),
      semanticValue: value == null ? null : l.formatFullDate(value!),
      placeholder: placeholder ?? s.chooseDate,
      helpText: helpText,
      error: error,
      required: required,
      onOpen: onChanged == null ? null : () => _open(context),
      side: side,
    );
  }
}

/// A preset range for [CmDateRangePicker]: a label and a function of today.
class CmDateRangePreset {
  const CmDateRangePreset(this.label, this.range, {this.translated, this.key}) : _weekly = null;

  /// A preset whose range depends on the first day of the week, like [thisWeek] and [lastWeek]. [range] reads
  /// the week as starting on Sunday; the picker uses its own first day ([resolve]).
  CmDateRangePreset.weekly(this.label, DateTimeRange Function(DateTime today, int firstDayOfWeek) inWeek, {this.translated, this.key})
      : range = ((t) => inWeek(t, 0)),
        _weekly = inWeek;

  final String label;
  final DateTimeRange Function(DateTime today) range;
  final DateTimeRange Function(DateTime today, int firstDayOfWeek)? _weekly;

  /// The label from [CmStrings] (built-in presets), so it follows [CmLocalizations].
  final String Function(CmStrings strings)? translated;

  /// The web's key for a built-in preset (`last-7-days`), reported by [CmDateRangePicker.onPresetChanged] and
  /// accepted by [CmDateRangePicker.preset]. Give your own presets a key to have them reported too. Since 1.16.
  final String? key;

  /// The "Custom" button ([custom]): not a range, it leaves the dates to the calendar.
  bool get isCustom => key == 'custom';

  /// The label in the current language.
  String labelIn(CmStrings strings) => translated?.call(strings) ?? label;

  /// The range on [today], with weeks starting on [firstDayOfWeek] (0 Sunday … 6 Saturday).
  DateTimeRange resolve(DateTime today, {int firstDayOfWeek = 0}) {
    final t = DateUtils.dateOnly(today);
    final weekly = _weekly;
    return weekly != null ? weekly(t, firstDayOfWeek) : range(t);
  }

  static DateTime _d(DateTime t, int days) => DateTime(t.year, t.month, t.day + days);
  static DateTime _weekStart(DateTime t, int firstDay) => _d(t, -((t.weekday % 7 - firstDay + 7) % 7));
  static DateTime _monthsBack(DateTime t, int n) {
    final last = DateTime(t.year, t.month - n + 1, 0).day;
    return DateTime(t.year, t.month - n, t.day > last ? last : t.day);
  }

  static final today = CmDateRangePreset('Today', (t) => DateTimeRange(start: t, end: t), key: 'today', translated: (s) => s.presetToday);
  static final yesterday = CmDateRangePreset('Yesterday', (t) => DateTimeRange(start: _d(t, -1), end: _d(t, -1)), key: 'yesterday', translated: (s) => s.presetYesterday);

  /// From the first day of this week to today. Since 1.16.
  static final thisWeek = CmDateRangePreset.weekly('This week', (t, f) => DateTimeRange(start: _weekStart(t, f), end: t), key: 'this-week', translated: (s) => s.presetThisWeek);

  /// The whole previous week. Since 1.16.
  static final lastWeek = CmDateRangePreset.weekly(
    'Last week',
    (t, f) => DateTimeRange(start: _d(_weekStart(t, f), -7), end: _d(_weekStart(t, f), -1)),
    key: 'last-week',
    translated: (s) => s.presetLastWeek,
  );
  static final last7Days = CmDateRangePreset('Last 7 days', (t) => DateTimeRange(start: _d(t, -6), end: t), key: 'last-7-days', translated: (s) => s.presetLast7Days);

  /// Since 1.16.
  static final last28Days = CmDateRangePreset('Last 28 days', (t) => DateTimeRange(start: _d(t, -27), end: t), key: 'last-28-days', translated: (s) => s.presetLast28Days);
  static final last30Days = CmDateRangePreset('Last 30 days', (t) => DateTimeRange(start: _d(t, -29), end: t), key: 'last-30-days', translated: (s) => s.presetLast30Days);

  /// Since 1.16.
  static final last90Days = CmDateRangePreset('Last 90 days', (t) => DateTimeRange(start: _d(t, -89), end: t), key: 'last-90-days', translated: (s) => s.presetLast90Days);

  /// From the day after the same date a year ago to today. Since 1.16.
  static final last12Months = CmDateRangePreset(
    'Last 12 months',
    (t) => DateTimeRange(start: _d(_monthsBack(t, 12), 1), end: t),
    key: 'last-12-months',
    translated: (s) => s.presetLast12Months,
  );
  static final thisMonth = CmDateRangePreset('This month', (t) => DateTimeRange(start: DateTime(t.year, t.month, 1), end: t), key: 'this-month', translated: (s) => s.presetThisMonth);
  static final lastMonth = CmDateRangePreset(
    'Last month',
    (t) => DateTimeRange(start: DateTime(t.year, t.month - 1, 1), end: DateTime(t.year, t.month, 0)),
    key: 'last-month',
    translated: (s) => s.presetLastMonth,
  );

  static DateTime _quarterStart(DateTime t) => DateTime(t.year, t.month - (t.month - 1) % 3, 1);

  /// From the first day of this quarter (1 January, April, July or October) to today. Since 1.18.
  static final quarterToDate = CmDateRangePreset(
    'Quarter to date',
    (t) => DateTimeRange(start: _quarterStart(t), end: t),
    key: 'quarter-to-date',
    translated: (s) => s.presetQuarterToDate,
  );

  /// The whole previous quarter. Since 1.18.
  static final lastQuarter = CmDateRangePreset(
    'Last quarter',
    (t) {
      final q = DateTime(t.year, _quarterStart(t).month - 3, 1);
      return DateTimeRange(start: q, end: DateTime(q.year, q.month + 3, 0));
    },
    key: 'last-quarter',
    translated: (s) => s.presetLastQuarter,
  );

  /// 1 January to today. Since 1.16.
  static final thisYear = CmDateRangePreset('This year', (t) => DateTimeRange(start: DateTime(t.year, 1, 1), end: t), key: 'this-year', translated: (s) => s.presetThisYear);

  /// The whole previous year. Since 1.16.
  static final lastYear = CmDateRangePreset(
    'Last year',
    (t) => DateTimeRange(start: DateTime(t.year - 1, 1, 1), end: DateTime(t.year - 1, 12, 31)),
    key: 'last-year',
    translated: (s) => s.presetLastYear,
  );

  /// The "Custom" button: the dates come from the calendar. It is pressed when the dates match no other preset.
  /// Listing it opens the range panel (see [CmDateRangePicker]). Since 1.16.
  static final custom = CmDateRangePreset('Custom', (t) => DateTimeRange(start: t, end: t), key: 'custom', translated: (s) => s.presetCustom);

  /// Today, Last 7 days, Last 30 days, This month: the order and report filter set.
  static final standard = [today, last7Days, last30Days, thisMonth];

  /// The report set (like an analytics date picker), ending with [custom]. Since 1.16.
  static final report = [today, yesterday, thisWeek, lastWeek, last7Days, last28Days, last30Days, thisMonth, lastMonth, thisYear, custom];

  /// What [CmDateRangeVariant.report] lists when [CmDateRangePicker.presets] is empty: [custom] first, then today,
  /// yesterday, this week, last 7 days, last week, last 28 days, last 30 days, this month, last month, last 90 days,
  /// quarter to date and this year (web: the `variant="report"` default). Since 1.18.
  static final reportVariant = [
    custom, today, yesterday, thisWeek, last7Days, lastWeek, last28Days, last30Days, thisMonth, lastMonth, last90Days, quarterToDate, thisYear,
  ];

  /// Every built-in preset.
  static final all = [
    today, yesterday, thisWeek, lastWeek, last7Days, last28Days, last30Days, last90Days, last12Months, thisMonth, lastMonth,
    quarterToDate, lastQuarter, thisYear, lastYear, custom,
  ];

  /// The built-in preset with [key] (`last-28-days`), or null.
  static CmDateRangePreset? byKey(String key) {
    for (final p in all) {
      if (p.key == key) return p;
    }
    return null;
  }
}

bool _sameDay(DateTime? a, DateTime? b) => a != null && b != null && DateUtils.isSameDay(a, b);

/// What the range panel returns: the range and the preset key it came from ('' custom; null: match the dates).
class _RangeResult {
  const _RangeResult(this.range, this.key);
  final DateTimeRange range;
  final String? key;
}

/// The layout of a [CmDateRangePicker]. Since 1.18.
enum CmDateRangeVariant {
  /// A date field (presets under it, or beside the calendar in the range panel).
  standard,

  /// For report and dashboard pages, like an analytics date picker (web `variant="report"`): the field is one button
  /// with the preset as a chip and the range ("Last 28 days · 23 Oct – 19 Nov 2026"); the popup lists the presets on
  /// the left ("Custom" first, each with its dates), start and end date boxes, months to scroll through, and Cancel
  /// and Apply. It always works as with [CmDateRangePicker.confirm].
  report,
}

/// A start and end date field with optional preset ranges. Mirrors `<cm-date-range-picker>`.
///
/// By default it opens the Material date range picker, themed with Commmerce tokens, and shows the presets as
/// buttons under the field. For reports (since 1.16), like an analytics date picker, set [months] to 2, [confirm],
/// or list [CmDateRangePreset.custom]: the field then opens the Commmerce range panel instead, with the presets
/// beside the calendar ("Custom" pressed when the dates match no preset), one or two months side by side (one on
/// phones, 640px or narrower) and, with [confirm], a footer with the draft range and Cancel and Apply.
///
/// For report and dashboard pages (since 1.18) set [variant] to [CmDateRangeVariant.report].
class CmDateRangePicker extends StatelessWidget {
  const CmDateRangePicker({
    super.key,
    required this.label,
    required this.value,
    required this.onChanged,
    required this.firstDate,
    required this.lastDate,
    this.presets = const [],
    this.helpText,
    this.error,
    this.placeholder,
    this.required = false,
    this.locale,
    this.today,
    this.preset,
    this.onPresetChanged,
    this.months = 1,
    this.confirm = false,
    this.firstDayOfWeek,
    this.variant = CmDateRangeVariant.standard,
  });

  final String label;

  /// The range. While it is null and [preset] is set, the field shows that preset's range today.
  final DateTimeRange? value;

  /// Called with the new range. Null disables the field.
  final ValueChanged<DateTimeRange>? onChanged;
  final DateTime firstDate, lastDate;

  /// Preset ranges, e.g. [CmDateRangePreset.standard] or [CmDateRangePreset.report]. Empty with
  /// [CmDateRangeVariant.report]: [CmDateRangePreset.reportVariant].
  final List<CmDateRangePreset> presets;
  final String? helpText, error;
  /// Shown while empty. Default: [CmStrings.chooseDate] / [CmStrings.chooseDates].
  final String? placeholder;
  final bool required;
  final Locale? locale;

  /// "Today" for presets; defaults to the current date (set it in tests).
  final DateTime? today;

  /// Key of the preset the range came from (`last-28-days`), or '' for dates picked in the calendar. Set it with
  /// a null [value] to open a report on that preset, counted from today (the key need not be in [presets];
  /// `CmDateRangePreset.byKey(key)!.resolve(today)` gives you the same dates). Save it with a report so "Last 28
  /// days" still means the last 28 days next week. Since 1.16.
  final String? preset;

  /// Called with the chosen preset's key ('' for custom dates) whenever the range changes, after [onChanged].
  /// Presets without a key report ''. Since 1.16.
  final ValueChanged<String>? onPresetChanged;

  /// Months side by side in the range panel: 1 (default) or 2. Phones (640px or narrower) show one. Since 1.16.
  final int months;

  /// Presets and dates picked in the range panel are a draft until Apply; Cancel, Escape or a tap outside drop it.
  /// Without it, choosing a preset or the end date changes the range at once. Since 1.16.
  final bool confirm;

  /// First column of the range panel and first day of [CmDateRangePreset.thisWeek] and [CmDateRangePreset.lastWeek]:
  /// 0 Sunday, 1 Monday … 6 Saturday. Default: the locale's (`MaterialLocalizations.firstDayOfWeekIndex`).
  final int? firstDayOfWeek;

  /// [CmDateRangeVariant.report] for report and dashboard pages (web `variant="report"`). [months] does not apply to
  /// it, and it always works as with [confirm]. Since 1.18.
  final CmDateRangeVariant variant;

  bool get _isReport => variant == CmDateRangeVariant.report;

  /// The presets listed: [presets], or the report set for an empty list with [CmDateRangeVariant.report].
  List<CmDateRangePreset> get _presets => presets.isEmpty && _isReport ? CmDateRangePreset.reportVariant : presets;

  DateTime get _today => DateUtils.dateOnly(today ?? DateTime.now());

  int _firstDay(BuildContext context) =>
      firstDayOfWeek == null ? MaterialLocalizations.of(context).firstDayOfWeekIndex : ((firstDayOfWeek! % 7) + 7) % 7;

  /// The Commmerce range panel instead of the Material picker.
  bool get _panel => months == 2 || confirm || presets.any((p) => p.isCustom);

  DateTimeRange _clamp(DateTimeRange r) {
    DateTime c(DateTime d) => d.isBefore(firstDate)
        ? firstDate
        : d.isAfter(lastDate)
        ? lastDate
        : d;
    return DateTimeRange(start: c(r.start), end: c(r.end));
  }

  CmDateRangePreset? _presetFor(String key) {
    for (final p in _presets) {
      if (p.key == key && !p.isCustom) return p;
    }
    final p = CmDateRangePreset.byKey(key);
    return p == null || p.isCustom ? null : p;
  }

  /// The range the field shows: [value], else [preset]'s range today.
  DateTimeRange? _shown(BuildContext context) {
    if (value != null) return value;
    final key = preset ?? '';
    final p = key.isEmpty ? null : _presetFor(key);
    return p == null ? null : _clamp(p.resolve(_today, firstDayOfWeek: _firstDay(context)));
  }

  /// Reports a new range and the preset it came from ([key] null: a listed preset with the same dates, or '').
  void _report(BuildContext context, DateTimeRange r, String? key) {
    final range = DateTimeRange(start: DateUtils.dateOnly(r.start), end: DateUtils.dateOnly(r.end));
    final fd = _firstDay(context);
    String match() {
      for (final p in _presets) {
        if (p.isCustom || p.key == null) continue;
        final pr = _clamp(p.resolve(_today, firstDayOfWeek: fd));
        if (_sameDay(pr.start, range.start) && _sameDay(pr.end, range.end)) return p.key!;
      }
      return '';
    }

    onChanged?.call(range);
    onPresetChanged?.call(key ?? match());
  }

  Future<void> _open(BuildContext context) async {
    if (_isReport) {
      final r = await showDialog<_RangeResult>(
        context: context,
        builder: (_) => _ReportPanel(picker: this, today: _today, firstDay: _firstDay(context), shown: _shown(context)),
      );
      if (r != null && context.mounted) _report(context, r.range, r.key);
      return;
    }
    if (_panel) {
      final r = await showDialog<_RangeResult>(
        context: context,
        builder: (_) => _RangePanel(picker: this, today: _today, firstDay: _firstDay(context), shown: _shown(context)),
      );
      if (r != null && context.mounted) _report(context, r.range, r.key);
      return;
    }
    final shown = _shown(context);
    final picked = await showDateRangePicker(
      context: context,
      initialDateRange: shown == null ? null : _clamp(shown),
      firstDate: firstDate,
      lastDate: lastDate,
      currentDate: _today,
      helpText: label,
      locale: locale,
      builder: _themed,
    );
    if (picked != null && context.mounted) _report(context, picked, null);
  }

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final l = MaterialLocalizations.of(context);
    final enabled = onChanged != null;
    final v = _shown(context);
    final fd = _firstDay(context);
    if (_isReport) return _buildReport(context, v, fd);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        _DateBox(
          label: label,
          text: v == null ? null : '${l.formatShortDate(v.start)} – ${l.formatShortDate(v.end)}',
          semanticValue: v == null ? null : CmStrings.of(context).dateRange(l.formatFullDate(v.start), l.formatFullDate(v.end)),
          placeholder: placeholder ?? CmStrings.of(context).chooseDates,
          helpText: helpText,
          error: error,
          required: required,
          onOpen: enabled ? () => _open(context) : null,
        ),
        if (presets.isNotEmpty && !_panel && !_isReport) ...[
          const SizedBox(height: CmSpace.s8),
          Semantics(
            container: true,
            label: CmStrings.of(context).presetRanges,
            child: Wrap(
              spacing: CmSpace.s8,
              runSpacing: CmSpace.s8,
              children: [
                for (final p in presets)
                  Builder(
                    builder: (context) {
                      final r = _clamp(p.resolve(_today, firstDayOfWeek: fd));
                      final on = v != null && DateUtils.isSameDay(v.start, r.start) && DateUtils.isSameDay(v.end, r.end);
                      return MergeSemantics(
                        child: Semantics(
                          selected: on,
                          child: OutlinedButton(
                            onPressed: enabled ? () => _report(context, r, p.key ?? '') : null,
                            style: OutlinedButton.styleFrom(
                              minimumSize: const Size(0, 32),
                              padding: const EdgeInsets.symmetric(horizontal: CmSpace.s16),
                              foregroundColor: on ? c.actionPrimaryText : c.textDefault,
                              backgroundColor: on ? c.actionPrimary : c.bgSurface,
                              side: BorderSide(color: on ? c.actionPrimary : c.borderSubtle),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(CmRadius.full)),
                              textStyle: CmType.bodyMd,
                            ),
                            child: Text(p.labelIn(CmStrings.of(context))),
                          ),
                        ),
                      );
                    },
                  ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  /// The report field: one button with the preset chip, the range and a chevron.
  Widget _buildReport(BuildContext context, DateTimeRange? v, int fd) {
    final c = CmTheme.colorsOf(context);
    final s = CmStrings.of(context);
    final l = MaterialLocalizations.of(context);
    final enabled = onChanged != null;
    final list = _presets;
    String? chip;
    final key = preset;
    if (key != null && key.isNotEmpty && key != 'custom') {
      chip = _presetFor(key)?.labelIn(s);
    } else if (v != null) {
      // Without a key the dates may still be a listed preset's ([preset] not kept by the app).
      if (key == null) {
        for (final p in list) {
          if (p.isCustom) continue;
          final r = _clamp(p.resolve(_today, firstDayOfWeek: fd));
          if (_sameDay(r.start, v.start) && _sameDay(r.end, v.end)) {
            chip = p.labelIn(s);
            break;
          }
        }
      }
      if (chip == null && list.any((p) => p.isCustom)) chip = s.presetCustom;
    }
    final range = v == null ? null : _rangeSpan(s, v.start, v.end, year: true);
    final full = v == null ? null : s.dateRange(l.formatFullDate(v.start), l.formatFullDate(v.end));
    final textColor = enabled ? c.textDefault : c.textSecondary;
    return _DateBox(
      label: label,
      text: range,
      semanticValue: full == null ? null : (chip == null ? full : '$chip, $full'),
      helpText: helpText,
      error: error,
      required: required,
      icon: CmIcons.chevronDown,
      onOpen: enabled ? () => _open(context) : null,
      content: Row(
        children: [
          if (chip != null) ...[
            Container(
              key: const ValueKey('cm-report-chip'),
              padding: const EdgeInsets.symmetric(horizontal: CmSpace.s8, vertical: 2),
              decoration: BoxDecoration(color: c.bgTag, borderRadius: BorderRadius.circular(CmRadius.xs)),
              child: Text(chip, maxLines: 1, style: CmType.bodyXs.copyWith(fontWeight: FontWeight.w500, color: textColor)),
            ),
            const SizedBox(width: CmSpace.s8),
          ],
          Expanded(
            child: Text(
              range ?? placeholder ?? s.chooseDates,
              key: const ValueKey('cm-report-range'),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: cmFieldText(context).copyWith(
                color: range == null ? c.textTertiary : textColor,
                fontFeatures: const [FontFeature.tabularFigures()],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// A range as short text: "23 Oct – 19 Nov 2026", "8 – 14 Nov", or one day when start and end are the same.
/// [year] adds the year (both years when they differ). Day-month order with [CmStrings.monthsShort], like the
/// other Flutter date texts (Flutter has no locale date formatter without the intl package).
String _rangeSpan(CmStrings s, DateTime a, DateTime? b, {required bool year}) {
  String d(DateTime x, {bool month = true, bool y = false}) => '${x.day}${month ? ' ${s.monthsShort[x.month - 1]}' : ''}${y ? ' ${x.year}' : ''}';
  if (b == null || DateUtils.isSameDay(a, b)) return d(a, y: year);
  if (a.year != b.year) return '${d(a, y: true)} – ${d(b, y: true)}';
  if (a.month == b.month) return '${d(a, month: false)} – ${d(b, y: year)}';
  return '${d(a)} – ${d(b, y: year)}';
}

/// The day an arrow, Home/End or Page key moves to from [f] in a range calendar (Shift+Page: a year), or null.
DateTime? _gridKeyTarget(BuildContext context, LogicalKeyboardKey key, DateTime f, int firstDay) {
  final rtl = Directionality.of(context) == TextDirection.rtl;
  var k = key;
  if (rtl && k == LogicalKeyboardKey.arrowLeft) {
    k = LogicalKeyboardKey.arrowRight;
  } else if (rtl && k == LogicalKeyboardKey.arrowRight) {
    k = LogicalKeyboardKey.arrowLeft;
  }
  DateTime day(int n) => DateTime(f.year, f.month, f.day + n);
  final dow = (f.weekday % 7 - firstDay + 7) % 7;
  final shift = HardwareKeyboard.instance.isShiftPressed;
  return switch (k) {
    LogicalKeyboardKey.arrowRight => day(1),
    LogicalKeyboardKey.arrowLeft => day(-1),
    LogicalKeyboardKey.arrowDown => day(7),
    LogicalKeyboardKey.arrowUp => day(-7),
    LogicalKeyboardKey.home => day(-dow),
    LogicalKeyboardKey.end => day(6 - dow),
    LogicalKeyboardKey.pageDown => CmDateRangePreset._monthsBack(f, shift ? -12 : -1),
    LogicalKeyboardKey.pageUp => CmDateRangePreset._monthsBack(f, shift ? 12 : 1),
    _ => null,
  };
}

/// 'start', 'end', 'in' (between them) or '' for [d], with the range [s]–[e] (while picking the end, [e] is the
/// hovered or focused day).
String _rangeMark(DateTime d, DateTime? s, DateTime? e) {
  if (_sameDay(d, s)) return 'start';
  if (e != null && s != null && _sameDay(d, e) && e.isAfter(s)) return 'end';
  if (s != null && e != null && d.isAfter(s) && d.isBefore(e)) return 'in';
  return '';
}

/// A day of a range calendar: a button named by the full date (and "start date" / "end date").
Widget _rangeDay(
  BuildContext context, {
  required DateTime d,
  required DateTime today,
  required bool off,
  required String mark,
  required bool focused,
  required double height,
  required VoidCallback onTap,
  required VoidCallback onHover,
}) {
  final c = CmTheme.colorsOf(context);
  final s = CmStrings.of(context);
  final l = MaterialLocalizations.of(context);
  final ends = mark == 'start' || mark == 'end';
  final isToday = DateUtils.isSameDay(d, today);
  final note = mark == 'start' ? s.dateRangeStartNote : mark == 'end' ? s.dateRangeEndNote : '';
  return Semantics(
    button: true,
    enabled: !off,
    selected: mark.isNotEmpty,
    focused: focused,
    label: '${l.formatFullDate(d)}${note.isEmpty ? '' : ', $note'}',
    excludeSemantics: true,
    onTap: off ? null : onTap,
    child: MouseRegion(
      onEnter: (_) => onHover(),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: off ? null : onTap,
        child: Container(
          key: ValueKey('cm-day-${d.year}-${d.month}-${d.day}'),
          height: height,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: ends ? c.actionPrimary : mark == 'in' ? c.bgAttentionSoft : null,
            borderRadius: mark == 'in' ? null : BorderRadius.circular(CmRadius.sm),
            border: focused ? Border.all(color: c.borderStrong, width: 2) : null,
          ),
          child: Text(
            '${d.day}',
            style: CmType.bodyMd.copyWith(
              color: off ? c.textSecondary : ends ? c.actionPrimaryText : c.textDefault,
              fontWeight: isToday ? FontWeight.w500 : null,
              decoration: off ? TextDecoration.lineThrough : isToday ? TextDecoration.underline : null,
              fontFeatures: const [FontFeature.tabularFigures()],
            ),
          ),
        ),
      ),
    ),
  );
}

/// A listed preset in the range panel, resolved for today.
class _Listed {
  const _Listed(this.preset, this.range);
  final CmDateRangePreset preset;
  final DateTimeRange range;
  String get key => preset.key ?? '';
}

/// The Commmerce range panel (web `cm-date-range-picker` popover): presets, one or two month grids, the status
/// line and, with `confirm`, the draft footer.
class _RangePanel extends StatefulWidget {
  const _RangePanel({required this.picker, required this.today, required this.firstDay, required this.shown});
  final CmDateRangePicker picker;
  final DateTime today;
  final int firstDay;
  final DateTimeRange? shown;

  @override
  State<_RangePanel> createState() => _RangePanelState();
}

class _RangePanelState extends State<_RangePanel> {
  DateTime? _ds, _de, _hover;
  String _dp = '';

  /// "Custom" was pressed or a day was picked.
  bool _custom = false;
  bool _pickingEnd = false;
  late DateTime _view, _focus;
  bool _started = false;
  final _grid = FocusNode(debugLabel: 'CmDateRangePicker grid');

  CmDateRangePicker get _p => widget.picker;
  DateTime get _first => DateUtils.dateOnly(_p.firstDate);
  DateTime get _last => DateUtils.dateOnly(_p.lastDate);
  DateTime _clampDay(DateTime d) => d.isBefore(_first) ? _first : d.isAfter(_last) ? _last : d;
  int get _months => _p.months == 2 && !cmIsNarrow(context) ? 2 : 1;

  List<_Listed> get _listed => [
        for (final p in _p.presets)
          if (!p.isCustom) _Listed(p, _p._clamp(p.resolve(widget.today, firstDayOfWeek: widget.firstDay))),
      ];

  @override
  void initState() {
    super.initState();
    _ds = widget.shown?.start == null ? null : DateUtils.dateOnly(widget.shown!.start);
    _de = widget.shown?.end == null ? null : DateUtils.dateOnly(widget.shown!.end);
    _dp = _p.preset ?? '';
    _grid.addListener(() {
      if (mounted) setState(() {});
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    final n = _months;
    // The end month is on the right when two months show, so a range such as "Last 30 days" is in view.
    final anchor = n == 2 ? (_de ?? _ds) : _ds;
    _view = DateUtils.addMonthsToMonthDate(DateTime((_clampDay(anchor ?? widget.today)).year, _clampDay(anchor ?? widget.today).month), 1 - n);
    _focus = _clampDay(_ds ?? anchor ?? widget.today);
    _showMonth(_focus);
  }

  @override
  void dispose() {
    _grid.dispose();
    super.dispose();
  }

  /// Moves the months shown so [d] is in view.
  void _showMonth(DateTime d) {
    final n = _months;
    final m = DateTime(d.year, d.month);
    if (m.isBefore(_view)) {
      _view = m;
    } else if (!m.isBefore(DateUtils.addMonthsToMonthDate(_view, n))) {
      _view = DateUtils.addMonthsToMonthDate(m, 1 - n);
    }
  }

  bool _off(DateTime d) => d.isBefore(_first) || d.isAfter(_last);

  void _pick(DateTime d) {
    if (_off(d)) return;
    setState(() {
      _dp = '';
      _custom = true;
      if (!_pickingEnd || _ds == null || d.isBefore(_ds!)) {
        _ds = d;
        _de = null;
        _pickingEnd = true;
        _focus = d;
        return;
      }
      _de = d;
      _pickingEnd = false;
      _focus = d;
    });
    if (_de != null && !_p.confirm) Navigator.of(context).pop(_RangeResult(DateTimeRange(start: _ds!, end: _de!), ''));
  }

  void _applyPreset(_Listed p) {
    if (!_p.confirm) {
      Navigator.of(context).pop(_RangeResult(p.range, p.key));
      return;
    }
    // A draft: shown in the calendar and the footer until Apply.
    setState(() {
      _ds = DateUtils.dateOnly(p.range.start);
      _de = DateUtils.dateOnly(p.range.end);
      _dp = p.key;
      _custom = false;
      _pickingEnd = false;
      _focus = _clampDay(_de!);
      _showMonth(_ds!);
      _showMonth(_de!);
    });
  }

  void _pickCustom() {
    setState(() {
      _custom = true;
      _dp = '';
      _pickingEnd = false;
    });
    _grid.requestFocus();
  }

  void _apply() {
    if (_ds == null || _de == null) return;
    Navigator.of(context).pop(_RangeResult(DateTimeRange(start: _ds!, end: _de!), _custom ? '' : (_dp.isEmpty ? null : _dp)));
  }

  void _moveFocus(DateTime d) {
    setState(() {
      _focus = _clampDay(d);
      _showMonth(_focus);
    });
  }

  KeyEventResult _onGridKey(FocusNode node, KeyEvent e) {
    if (e is! KeyDownEvent && e is! KeyRepeatEvent) return KeyEventResult.ignored;
    final k = e.logicalKey;
    final next = _gridKeyTarget(context, k, _focus, widget.firstDay);
    if (next != null) {
      _moveFocus(next);
      return KeyEventResult.handled;
    }
    if (k == LogicalKeyboardKey.enter || k == LogicalKeyboardKey.numpadEnter || k == LogicalKeyboardKey.space) {
      _pick(_focus);
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  /// 'start', 'end', 'in' (between them) or ''.
  String _mark(DateTime d) => _rangeMark(d, _ds, _de ?? (_pickingEnd && _ds != null ? (_hover ?? _focus) : null));

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final s = CmStrings.of(context);
    final l = MaterialLocalizations.of(context);
    final narrow = cmIsNarrow(context);
    final months = _months;
    final listed = _listed;
    final hasCustom = _p.presets.any((p) => p.isCustom);

    // The pressed preset: with confirm the draft's, else the range's. A key wins over matching dates.
    final rs = _p.confirm ? _ds : widget.shown?.start;
    final re = _p.confirm ? _de : widget.shown?.end;
    final key = _p.confirm ? _dp : (_p.preset ?? '');
    final keyed = !_custom && key.isNotEmpty && listed.any((p) => p.key == key);
    bool pressed(_Listed p) => !_custom && (keyed ? p.key == key : _sameDay(p.range.start, rs) && _sameDay(p.range.end, re));
    final customPressed = _custom || (!listed.any(pressed) && (rs != null || re != null));

    Widget presetButton(String text, bool on, VoidCallback onTap, String id) => Semantics(
          button: true,
          selected: on,
          label: text,
          excludeSemantics: true,
          onTap: onTap,
          child: InkWell(
            key: ValueKey('cm-preset-$id'),
            onTap: onTap,
            borderRadius: BorderRadius.circular(narrow ? CmRadius.full : CmRadius.sm),
            child: Container(
              constraints: const BoxConstraints(minHeight: CmControlHeight.sm),
              width: narrow ? null : double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: CmSpace.s8, vertical: CmSpace.s4),
              alignment: narrow ? null : AlignmentDirectional.centerStart,
              decoration: BoxDecoration(
                color: on ? c.actionPrimary : null,
                border: narrow ? Border.all(color: on ? c.actionPrimary : c.borderSubtle) : null,
                borderRadius: BorderRadius.circular(narrow ? CmRadius.full : CmRadius.sm),
              ),
              child: Text(text, style: CmType.bodyMd.copyWith(color: on ? c.actionPrimaryText : c.textDefault)),
            ),
          ),
        );

    final buttons = [
      for (final p in listed) presetButton(p.preset.labelIn(s), pressed(p), () => _applyPreset(p), p.key.isEmpty ? p.preset.label : p.key),
      if (hasCustom) presetButton(s.presetCustom, customPressed, _pickCustom, 'custom'),
    ];
    Widget? presetList;
    if (buttons.isNotEmpty) {
      presetList = Semantics(
        container: true,
        explicitChildNodes: true,
        label: s.presetRanges,
        child: narrow
            ? Padding(
                padding: const EdgeInsets.only(bottom: CmSpace.s8),
                child: Wrap(spacing: CmSpace.s4, runSpacing: CmSpace.s4, children: buttons),
              )
            : Container(
                width: 160,
                padding: const EdgeInsetsDirectional.only(end: CmSpace.s12),
                decoration: BoxDecoration(border: BorderDirectional(end: BorderSide(color: c.borderSubtle))),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [for (final b in buttons) Padding(padding: const EdgeInsets.only(bottom: 2), child: b)],
                ),
              ),
      );
    }

    final width = MediaQuery.sizeOf(context).width;
    final calWidth = narrow ? (width - 32 - 24).clamp(220.0, 280.0) : 280.0;
    final cals = Focus(
      focusNode: _grid,
      autofocus: true,
      onKeyEvent: _onGridKey,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (var i = 0; i < months; i++) ...[
            if (i > 0) const SizedBox(width: CmSpace.s24),
            SizedBox(width: calWidth, child: _month(context, i, months, narrow)),
          ],
        ],
      ),
    );

    final status = _pickingEnd && _ds != null ? s.dateRangeChooseEnd(l.formatShortDate(_ds!)) : s.dateRangeChooseStart;
    final draft = _ds != null && _de != null
        ? '${l.formatShortDate(_ds!)} – ${l.formatShortDate(_de!)}'
        : _ds != null
        ? '${l.formatShortDate(_ds!)} –'
        : s.dateRangeNoDates;

    final main = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        cals,
        const SizedBox(height: CmSpace.s8),
        Semantics(liveRegion: true, child: Text(status, style: CmType.bodyXs.copyWith(color: c.textTertiary))),
        if (_p.confirm)
          Container(
            margin: const EdgeInsets.only(top: CmSpace.s12),
            padding: const EdgeInsets.only(top: CmSpace.s12),
            width: months * calWidth + (months - 1) * CmSpace.s24,
            decoration: BoxDecoration(border: Border(top: BorderSide(color: c.borderSubtle))),
            child: Wrap(
              alignment: WrapAlignment.end,
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: CmSpace.s8,
              runSpacing: CmSpace.s8,
              children: [
                ConstrainedBox(
                  constraints: BoxConstraints(minWidth: narrow ? 0 : months * calWidth - 200),
                  child: Text(draft, key: const ValueKey('cm-range-draft'), style: CmType.bodyMd.copyWith(color: c.textDefault, fontFeatures: const [FontFeature.tabularFigures()])),
                ),
                CmButton(label: s.dateRangeCancel, onPressed: () => Navigator.of(context).pop()),
                CmButton(
                  label: s.dateRangeApply,
                  variant: CmButtonVariant.primary,
                  onPressed: _ds != null && _de != null ? _apply : null,
                ),
              ],
            ),
          ),
      ],
    );

    return Dialog(
      backgroundColor: c.bgSurface,
      surfaceTintColor: Colors.transparent,
      insetPadding: const EdgeInsets.all(CmSpace.s16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(CmRadius.md), side: BorderSide(color: c.borderSubtle)),
      child: Semantics(
        label: s.chooseDates,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(CmSpace.s12),
          child: narrow
              ? Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
                  if (presetList != null) SizedBox(width: calWidth, child: presetList),
                  main,
                ])
              : IntrinsicHeight(
                  child: Row(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                    if (presetList != null) ...[presetList, const SizedBox(width: CmSpace.s12)],
                    main,
                  ]),
                ),
        ),
      ),
    );
  }

  Widget _month(BuildContext context, int i, int months, bool narrow) {
    final c = CmTheme.colorsOf(context);
    final s = CmStrings.of(context);
    final l = MaterialLocalizations.of(context);
    final month = DateUtils.addMonthsToMonthDate(_view, i);
    final fd = widget.firstDay;
    final prevOff = DateTime(month.year, month.month, 0).isBefore(_first);
    final nextOff = DateTime(month.year, month.month + 1).isAfter(_last);
    final showPrev = months == 1 || i == 0;
    final showNext = months == 1 || i == months - 1;

    Widget nav(bool previous) {
      final off = previous ? prevOff : nextOff;
      final step = previous ? -1 : 1;
      void go() => setState(() {
            _view = DateUtils.addMonthsToMonthDate(_view, step);
            _focus = _clampDay(CmDateRangePreset._monthsBack(_focus, -step));
            _showMonth(_focus);
          });
      return Semantics(
        button: true,
        enabled: !off,
        label: previous ? s.calendarPreviousMonth : s.calendarNextMonth,
        excludeSemantics: true,
        onTap: off ? null : go,
        child: InkWell(
          onTap: off ? null : go,
          borderRadius: BorderRadius.circular(CmRadius.sm),
          child: SizedBox.square(
            dimension: 32,
            child: Center(
              child: CmIcon(previous ? CmIcons.chevronLeft : CmIcons.chevronRight, size: 18, color: off ? c.textSecondary : c.iconSelected),
            ),
          ),
        ),
      );
    }

    final first = DateTime(month.year, month.month);
    final lead = (first.weekday % 7 - fd + 7) % 7;
    final days = DateUtils.getDaysInMonth(month.year, month.month);
    final cells = <DateTime?>[...List.filled(lead, null), for (var d = 1; d <= days; d++) DateTime(month.year, month.month, d)];
    while (cells.length % 7 != 0) {
      cells.add(null);
    }
    final cellH = narrow ? 36.0 : 40.0;
    final focusOn = _grid.hasFocus;

    Widget day(DateTime d) => _rangeDay(
          context,
          d: d,
          today: widget.today,
          off: _off(d),
          mark: _mark(d),
          focused: focusOn && DateUtils.isSameDay(d, _focus),
          height: cellH,
          onTap: () => _pick(d),
          onHover: () {
            if (_pickingEnd) setState(() => _hover = d);
          },
        );

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(children: [
          if (showPrev) nav(true) else const SizedBox(width: 32),
          Expanded(
            child: Semantics(
              header: true,
              liveRegion: true,
              child: Text(l.formatMonthYear(month), textAlign: TextAlign.center, style: CmType.bodyMd.copyWith(fontWeight: FontWeight.w500, color: c.textDefault)),
            ),
          ),
          if (showNext) nav(false) else const SizedBox(width: 32),
        ]),
        const SizedBox(height: CmSpace.s8),
        ExcludeSemantics(
          child: SizedBox(
            height: 32,
            child: Row(children: [
              for (var k = 0; k < 7; k++)
                Expanded(child: Center(child: Text(l.narrowWeekdays[(k + fd) % 7], style: CmType.bodyXs.copyWith(color: c.textTertiary)))),
            ]),
          ),
        ),
        for (var w = 0; w < cells.length; w += 7)
          Row(children: [
            for (var k = w; k < w + 7; k++) Expanded(child: cells[k] == null ? SizedBox(height: cellH) : day(cells[k]!)),
          ]),
      ],
    );
  }
}

/// One row in the combobox list: an option, the "Add …" row, or a message.
class _Row<T> {
  const _Row.option(this.option) : create = null, message = null;
  const _Row.create(String this.create) : option = null, message = null;
  const _Row.message(String this.message) : option = null, create = null;
  final CmSelectOption<T>? option;
  final String? create, message;
}

class _Controller extends TextEditingController {
  /// Re-runs the autocomplete options builder (new async options arrived). RawAutocomplete only rebuilds its
  /// options when the text changes, so change it and put it back in the same frame.
  void refresh() {
    final v = value;
    value = v.copyWith(text: '${v.text}\u200b');
    value = v;
  }
}

/// How typing narrows a [CmCombobox] list.
enum CmComboboxFilter { contains, startsWith, none }

/// A text field that suggests matching options as the merchant types, built on [RawAutocomplete]. Picks one
/// option, or several with [multiple]: removable 24px [CmTag]s that wrap as the box grows; while the box isn't focused
/// only [maxTags] show, then one "+N more" tag (owner standard, 1.6). Keyboard with [multiple]: Backspace in the empty
/// box removes the last tag; ← (→ in right-to-left text) at the start of the box moves to the tags, ←/→ and Home/End
/// move between them, Backspace or Delete removes the focused tag, and → past the last tag (or Esc) goes back to the
/// box. The tags are not Tab stops.
/// For server results set [filter] to [CmComboboxFilter.none], fetch in [onSearch], then pass new [options] and
/// [loading]. Mirrors `<cm-combobox>`.
class CmCombobox<T extends Object> extends StatefulWidget {
  const CmCombobox({
    super.key,
    required this.label,
    required this.options,
    this.value,
    this.onChanged,
    this.multiple = false,
    this.values = const [],
    this.onValuesChanged,
    this.allowCustom = false,
    this.onCreate,
    this.onSearch,
    this.filter = CmComboboxFilter.contains,
    this.loading = false,
    this.emptyText,
    this.loadingText,
    this.placeholder,
    this.helpText,
    this.error,
    this.required = false,
    this.enabled = true,
    this.showGroup = false,
    this.maxTags = 3,
  });

  final String label;

  /// With [multiple]: how many tags show while the box isn't focused; the rest become one "+N more" tag. Every tag
  /// shows while the merchant is in the box. 0 shows them all. Since 1.7 (web 1.6).
  final int maxTags;

  /// The options. Give them a [CmSelectOption.group] to show them under group headings (since 1.3): headings
  /// are read as headings and skipped by the arrow keys, and filtering keeps the heading of every group that
  /// still has a match.
  final List<CmSelectOption<T>> options;

  /// Shows the chosen option's group before its label in the field, or in its tag with [multiple]
  /// ([CmStrings.comboboxGrouped], "Lead: Company"). Since 1.3.
  final bool showGroup;

  /// Chosen value (single mode).
  final T? value;
  final ValueChanged<T?>? onChanged;

  /// Choose several options, shown as tags.
  final bool multiple;

  /// Chosen values ([multiple]).
  final List<T> values;
  final ValueChanged<List<T>>? onValuesChanged;

  /// Offer "Add …" for text that matches no option; [onCreate] receives the text and adds the option.
  final bool allowCustom;
  final ValueChanged<String>? onCreate;

  /// Called as the merchant types, with the query.
  final ValueChanged<String>? onSearch;
  final CmComboboxFilter filter;

  /// Shows a spinner row while you load options.
  final bool loading;
  /// Default: [CmStrings.noResults] and [CmStrings.loading].
  final String? emptyText, loadingText;
  final String? placeholder, helpText, error;
  final bool required, enabled;

  @override
  State<CmCombobox<T>> createState() => _CmComboboxState<T>();
}

class _CmComboboxState<T extends Object> extends State<CmCombobox<T>> {
  final _controller = _Controller();
  final _focus = FocusNode(debugLabel: 'CmCombobox');
  final Map<T, String> _labels = {};
  final Map<T, String> _groups = {};
  final List<FocusNode> _tagNodes = [];
  bool _focusIn = false;

  FocusNode _tagNode(int i) {
    while (_tagNodes.length <= i) {
      _tagNodes.add(FocusNode(debugLabel: 'CmCombobox tag ${_tagNodes.length}'));
    }
    return _tagNodes[i];
  }

  /// Focuses the tag at [i] (its remove button), or the text box when there is none. After the next frame, so a
  /// tag that was just removed has gone.
  void _focusTag(int i) {
    WidgetsBinding.instance.ensureVisualUpdate();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      if (i >= 0 && i < widget.values.length) {
        _tagNode(i).requestFocus();
      } else {
        _focus.requestFocus();
      }
    });
  }

  KeyEventResult _onTagKey(int i, KeyEvent e) {
    if (e is! KeyDownEvent && e is! KeyRepeatEvent) return KeyEventResult.ignored;
    final rtl = Directionality.of(context) == TextDirection.rtl;
    var k = e.logicalKey;
    if (rtl && k == LogicalKeyboardKey.arrowLeft) {
      k = LogicalKeyboardKey.arrowRight;
    } else if (rtl && k == LogicalKeyboardKey.arrowRight) {
      k = LogicalKeyboardKey.arrowLeft;
    }
    final last = widget.values.length - 1;
    if (k == LogicalKeyboardKey.arrowLeft) {
      _focusTag(i > 0 ? i - 1 : 0);
    } else if (k == LogicalKeyboardKey.arrowRight) {
      _focusTag(i < last ? i + 1 : -1);
    } else if (k == LogicalKeyboardKey.home) {
      _focusTag(0);
    } else if (k == LogicalKeyboardKey.end) {
      _focusTag(last);
    } else if (k == LogicalKeyboardKey.escape) {
      _focusTag(-1);
    } else if ((k == LogicalKeyboardKey.backspace || k == LogicalKeyboardKey.delete) && widget.enabled) {
      final left = widget.values.length - 1;
      widget.onValuesChanged?.call(widget.values.where((x) => x != widget.values[i]).toList());
      // Backspace goes to the tag before (or the new first one); Delete to the one that moved into its place.
      _focusTag(k == LogicalKeyboardKey.backspace ? (i > 0 ? i - 1 : (left > 0 ? 0 : -1)) : (i < left ? i : -1));
    } else {
      return KeyEventResult.ignored;
    }
    return KeyEventResult.handled;
  }

  @override
  void initState() {
    super.initState();
    _remember();
    _focus.addListener(_onFocus);
  }

  bool _started = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // The shown text can depend on CmStrings (showGroup), which initState can't read.
    if (!_started && !widget.multiple) _controller.text = _displayOf(widget.value) ?? '';
    _started = true;
  }

  @override
  void didUpdateWidget(CmCombobox<T> old) {
    super.didUpdateWidget(old);
    _remember();
    if (!widget.multiple && (old.value != widget.value || old.showGroup != widget.showGroup) && !_focus.hasFocus) _controller.text = _displayOf(widget.value) ?? '';
    if (old.options != widget.options || old.loading != widget.loading) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _controller.refresh();
      });
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _focus.dispose();
    for (final n in _tagNodes) {
      n.dispose();
    }
    super.dispose();
  }

  void _remember() {
    for (final o in widget.options) {
      _labels[o.value] = o.label;
      if ((o.group ?? '').isNotEmpty) _groups[o.value] = o.group!;
    }
  }

  String? _labelOf(T? v) => v == null ? null : _labels[v] ?? v.toString();

  /// The chosen value as shown in the field or its tag: the label, or "Group: label" with [CmCombobox.showGroup].
  String? _displayOf(T? v) {
    final label = _labelOf(v);
    final group = v == null ? null : _groups[v];
    if (label == null || !widget.showGroup || group == null) return label;
    return CmStrings.of(context).comboboxGrouped(group, label);
  }

  void _onFocus() {
    // Leaving the field: single mode shows the chosen label again; multiple clears an unfinished query.
    if (!_focus.hasFocus) _controller.text = widget.multiple ? '' : (_displayOf(widget.value) ?? '');
    setState(() {}); // focus ring on the box
  }

  bool _selected(T v) => widget.multiple ? widget.values.contains(v) : widget.value == v;

  Iterable<_Row<T>> _rows(TextEditingValue tv) {
    final q = tv.text.trim();
    final lq = q.toLowerCase();
    final strings = CmStrings.of(context);
    if (widget.loading) return [_Row<T>.message(widget.loadingText ?? strings.loading)];
    final showAll = widget.filter == CmComboboxFilter.none || q.isEmpty || (!widget.multiple && q == _displayOf(widget.value));
    final matches = cmSortByGroup(widget.options).where((o) {
      if (showAll) return true;
      final l = o.label.toLowerCase();
      return widget.filter == CmComboboxFilter.startsWith ? l.startsWith(lq) : l.contains(lq);
    });
    final rows = [for (final o in matches) _Row<T>.option(o)];
    final exists = widget.options.any((o) => o.label.toLowerCase() == lq) || _labels.values.any((l) => l.toLowerCase() == lq);
    if (widget.allowCustom && q.isNotEmpty && !exists) rows.add(_Row<T>.create(q));
    if (rows.isEmpty) return [_Row<T>.message(widget.emptyText ?? strings.noResults)];
    return rows;
  }

  void _pick(_Row<T> row) {
    if (row.message != null) {
      _controller.text = '';
      return;
    }
    if (row.create != null) {
      widget.onCreate?.call(row.create!);
      _controller.text = widget.multiple ? '' : row.create!;
      return;
    }
    final v = row.option!.value;
    if (widget.multiple) {
      final next = widget.values.contains(v) ? widget.values.where((x) => x != v).toList() : [...widget.values, v];
      widget.onValuesChanged?.call(next);
      _controller.text = '';
      _focus.requestFocus();
    } else {
      _remember();
      _controller.text = _displayOf(v) ?? row.option!.label;
      if (v != widget.value) widget.onChanged?.call(v);
    }
  }

  void _remove(T v) {
    widget.onValuesChanged?.call(widget.values.where((x) => x != v).toList());
    _focus.requestFocus();
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent e) {
    final rtl = Directionality.of(context) == TextDirection.rtl;
    final toTags = rtl ? LogicalKeyboardKey.arrowRight : LogicalKeyboardKey.arrowLeft;
    final sel = _controller.selection;
    if (e is KeyDownEvent && e.logicalKey == toTags && widget.multiple && widget.values.isNotEmpty && sel.isCollapsed && sel.baseOffset <= 0) {
      _focusTag(widget.values.length - 1);
      return KeyEventResult.handled;
    }
    if (e is KeyDownEvent &&
        e.logicalKey == LogicalKeyboardKey.backspace &&
        widget.multiple &&
        _controller.text.isEmpty &&
        widget.values.isNotEmpty) {
      _remove(widget.values.last);
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final hasError = widget.error != null && widget.error!.isNotEmpty;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        ExcludeSemantics(
          child: Text.rich(
            TextSpan(
              children: [
                TextSpan(
                  text: widget.label,
                  style: CmText.of(context).label.copyWith(color: c.textDefault),
                ),
                if (widget.required)
                  TextSpan(
                    text: ' *',
                    style: TextStyle(color: c.textCritical),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: CmSpace.s8),
        Focus(
          canRequestFocus: false,
          skipTraversal: true,
          onFocusChange: (f) => setState(() => _focusIn = f),
          child: RawAutocomplete<_Row<T>>(
          textEditingController: _controller,
          focusNode: _focus,
          displayStringForOption: (r) => r.option == null ? (r.create ?? '') : (_displayOf(r.option!.value) ?? r.option!.label),
          optionsBuilder: _rows,
          onSelected: _pick,
          fieldViewBuilder: (context, controller, focusNode, onSubmitted) => InputDecorator(
            isFocused: focusNode.hasFocus,
            isEmpty: false,
            decoration: InputDecoration(
              enabled: widget.enabled,
              isDense: true,
              constraints: BoxConstraints(minHeight: cmFieldHeight(context)),
                contentPadding: cmFieldPadding(cmFieldHeight(context)),
              fillColor: widget.enabled ? c.bgSurface : c.bgInputFilled,
              
              suffixIcon: CmIcon(CmIcons.chevronDown, size: 16, color: c.iconSelected),
              suffixIconConstraints: const BoxConstraints(minWidth: 32, minHeight: 24),
              errorText: hasError ? widget.error : null,
              errorStyle: CmType.bodyXs.copyWith(color: c.textCritical),
              helperText: hasError ? null : widget.helpText,
              helperStyle: CmType.bodyXs.copyWith(color: c.textTertiary),
            ),
            child: Wrap(
              spacing: CmSpace.s4,
              runSpacing: CmSpace.s4,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                if (widget.multiple) ..._tags(context),
                ConstrainedBox(
                  constraints: const BoxConstraints(minWidth: 80, maxWidth: 600),
                  child: IntrinsicWidth(
                    child: Focus(
                      canRequestFocus: false,
                      skipTraversal: true,
                      onKeyEvent: _onKey,
                      child: Semantics(
                        label: '${widget.label}${widget.required ? CmStrings.of(context).requiredSuffix : ''}',
                        hint: hasError ? widget.error : widget.helpText,
                        child: TextField(
                          controller: controller,
                          focusNode: focusNode,
                          enabled: widget.enabled,
                          onChanged: widget.onSearch,
                          onSubmitted: (_) => onSubmitted(),
                          style: cmFieldText(context).copyWith(color: widget.enabled ? c.textDefault : c.textSecondary),
                          decoration: InputDecoration.collapsed(
                            hintText: widget.multiple && widget.values.isNotEmpty ? null : widget.placeholder,
                            hintStyle: cmFieldText(context).copyWith(color: c.textTertiary),
                          ).copyWith(filled: false),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          optionsViewBuilder: (context, onSelected, rows) {
            final list = rows.toList();
            final highlighted = AutocompleteHighlightedOption.of(context);
            return Align(
              alignment: Alignment.topLeft,
              child: Padding(
                padding: const EdgeInsets.only(top: CmSpace.s8),
                child: Material(
                  color: c.bgSurface,
                  elevation: 2,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(CmRadius.md),
                    side: BorderSide(color: c.borderSubtle),
                  ),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxHeight: 240, maxWidth: 600),
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: CmSpace.s8),
                      shrinkWrap: true,
                      itemCount: list.length,
                      itemBuilder: (context, i) {
                        final r = list[i];
                        if (r.message != null) {
                          return Semantics(
                            liveRegion: true,
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: CmSpace.s20, vertical: CmSpace.s16),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (widget.loading) ...[
                                    SizedBox.square(dimension: 16, child: CircularProgressIndicator(strokeWidth: 2, color: c.borderStrong)),
                                    const SizedBox(width: CmSpace.s8),
                                  ],
                                  Text(r.message!, style: CmType.bodyMd.copyWith(color: c.textTertiary)),
                                ],
                              ),
                            ),
                          );
                        }
                        final active = i == highlighted;
                        final sel = r.option != null && _selected(r.option!.value);
                        final single = !widget.multiple && sel;
                        // A group heading before the first row of each group (not a row: the arrows skip it).
                        final group = r.option?.group ?? '';
                        final prev = i > 0 ? (list[i - 1].option?.group ?? '') : null;
                        final heading = group.isNotEmpty && group != prev ? CmOptionGroupHeading(group, divider: i > 0) : null;
                        final divider = heading == null && i > 0 && group.isEmpty && (prev ?? '').isNotEmpty;
                        final row = Semantics(
                          selected: sel,
                          button: true,
                          child: InkWell(
                            onTap: () => onSelected(r),
                            child: Container(
                              constraints: const BoxConstraints(minHeight: 40),
                              padding: const EdgeInsets.symmetric(horizontal: CmSpace.s20, vertical: CmSpace.s8),
                              color: single ? (active ? c.actionPrimaryHover : c.actionPrimary) : (active ? c.bgHover : null),
                              child: Row(
                                children: [
                                  if (r.create != null) ...[CmIcon(CmIcons.plus, size: 16, color: c.textDefault), const SizedBox(width: CmSpace.s8)],
                                  if (widget.multiple && r.option != null) ...[
                                    Opacity(
                                      opacity: sel ? 1 : 0,
                                      child: CmIcon(CmIcons.check, size: 16, color: c.textDefault),
                                    ),
                                    const SizedBox(width: CmSpace.s8),
                                  ],
                                  Expanded(
                                    child: Text(
                                      r.create != null ? CmStrings.of(context).addValue(r.create!) : r.option!.label,
                                      style: CmType.bodyMd.copyWith(color: single ? c.actionPrimaryText : c.textDefault),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                        if (heading == null && !divider) return row;
                        return Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: [
                          if (heading != null) heading,
                          if (divider) Container(margin: const EdgeInsets.symmetric(vertical: CmSpace.s4), height: 1, color: c.borderSubtle),
                          row,
                        ]);
                      },
                    ),
                  ),
                ),
              ),
            );
          },
        )),
      ],
    );
  }

  /// The chosen values as tags, with the overflow as one "+N more" tag while focus is elsewhere.
  List<Widget> _tags(BuildContext context) {
    final s = CmStrings.of(context);
    final values = widget.values;
    final limit = widget.maxTags > 0 && !_focusIn && values.length > widget.maxTags ? widget.maxTags : values.length;
    final hidden = values.length - limit;
    return [
      for (var i = 0; i < limit; i++)
        CmTag(
          _displayOf(values[i]) ?? '',
          focusNode: _tagNode(i),
          tabStop: false,
          onKeyEvent: (_, e) => _onTagKey(i, e),
          onRemove: widget.enabled ? () => _remove(values[i]) : null,
        ),
      if (hidden > 0) CmTag(s.comboboxMore(hidden)),
    ];
  }
}

/// The popup of [CmDateRangeVariant.report] (web `variant="report"`): presets with their dates on the left, typed
/// start and end boxes, months listed one under another, and a footer with the draft, its length, Cancel and Apply.
/// Everything is a draft until Apply.
class _ReportPanel extends StatefulWidget {
  const _ReportPanel({required this.picker, required this.today, required this.firstDay, required this.shown});
  final CmDateRangePicker picker;
  final DateTime today;
  final int firstDay;
  final DateTimeRange? shown;

  @override
  State<_ReportPanel> createState() => _ReportPanelState();
}

class _ReportPanelState extends State<_ReportPanel> {
  static const _headH = 34.0, _cellH = 36.0, _weekH = 32.0;

  DateTime? _ds, _de, _hover;
  String _dp = '';

  /// "Custom" was pressed, a day was picked or a date typed.
  bool _custom = false;
  bool _pickingEnd = false;
  late DateTime _focus;
  late final ScrollController _scroll;
  bool _started = false;
  final _grid = FocusNode(debugLabel: 'CmDateRangePicker months');
  final _startText = TextEditingController(), _endText = TextEditingController();
  final _startFocus = FocusNode(debugLabel: 'CmDateRangePicker start'), _endFocus = FocusNode(debugLabel: 'CmDateRangePicker end');

  CmDateRangePicker get _p => widget.picker;
  DateTime get _first => DateUtils.dateOnly(_p.firstDate);
  DateTime get _last => DateUtils.dateOnly(_p.lastDate);
  DateTime _clampDay(DateTime d) => d.isBefore(_first) ? _first : d.isAfter(_last) ? _last : d;
  bool _off(DateTime d) => d.isBefore(_first) || d.isAfter(_last);
  bool get _hasCustom => _p._presets.any((p) => p.isCustom);

  List<_Listed> get _listed => [
        for (final p in _p._presets)
          if (!p.isCustom) _Listed(p, _p._clamp(p.resolve(widget.today, firstDayOfWeek: widget.firstDay))),
      ];

  @override
  void initState() {
    super.initState();
    _ds = widget.shown == null ? null : DateUtils.dateOnly(widget.shown!.start);
    _de = widget.shown == null ? null : DateUtils.dateOnly(widget.shown!.end);
    _dp = _p.preset ?? '';
    _focus = _clampDay(_ds ?? widget.today);
    // Opens with the draft's first month (or today's) at the top of the list.
    final m = _ds ?? _clampDay(widget.today);
    _scroll = ScrollController(initialScrollOffset: _offsetOf(DateTime(m.year, m.month)));
    _grid.addListener(_rebuild);
    _startFocus.addListener(() {
      if (!_startFocus.hasFocus) _commit(true);
    });
    _endFocus.addListener(() {
      if (!_endFocus.hasFocus) _commit(false);
    });
  }

  void _rebuild() {
    if (mounted) setState(() {});
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    _syncText();
  }

  @override
  void dispose() {
    _grid.dispose();
    _scroll.dispose();
    _startText.dispose();
    _endText.dispose();
    _startFocus.dispose();
    _endFocus.dispose();
    super.dispose();
  }

  String _format(DateTime? d) => d == null ? '' : MaterialLocalizations.of(context).formatCompactDate(d);

  /// The boxes show the draft.
  void _syncText() {
    _startText.text = _format(_ds);
    _endText.text = _format(_de);
  }

  /// The months listed: a year before the range (or today) to two months after, within the first and last dates.
  List<DateTime> get _months {
    final points = [widget.today, ?_ds, ?_de, _focus];
    var lo = points.first, hi = points.first;
    for (final p in points) {
      if (p.isBefore(lo)) lo = p;
      if (p.isAfter(hi)) hi = p;
    }
    var first = DateUtils.addMonthsToMonthDate(DateTime(lo.year, lo.month), -12);
    var last = DateUtils.addMonthsToMonthDate(DateTime(hi.year, hi.month), 2);
    final min = DateTime(_first.year, _first.month), max = DateTime(_last.year, _last.month);
    if (min.isAfter(first)) first = min;
    if (max.isBefore(last)) last = max;
    if (first.isAfter(last)) first = last;
    return [for (var m = first; !m.isAfter(last); m = DateUtils.addMonthsToMonthDate(m, 1)) m];
  }

  int _lead(DateTime m) => (DateTime(m.year, m.month).weekday % 7 - widget.firstDay + 7) % 7;
  int _rows(DateTime m) => ((_lead(m) + DateUtils.getDaysInMonth(m.year, m.month)) / 7).ceil();

  /// Scroll offset of [month]'s heading in the list.
  double _offsetOf(DateTime month) {
    var y = 0.0;
    for (final m in _months) {
      if (!m.isBefore(month)) break;
      y += _headH + _rows(m) * _cellH;
    }
    return y;
  }

  /// Scrolls the list so [d]'s month is at the top.
  void _scrollTo(DateTime d) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || !_scroll.hasClients) return;
      final pos = _scroll.position;
      _scroll.jumpTo(_offsetOf(DateTime(d.year, d.month)).clamp(pos.minScrollExtent, pos.maxScrollExtent));
    });
  }

  /// Scrolls the list as little as needed to show [d] (the focused day) under its month heading.
  void _reveal(DateTime d) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || !_scroll.hasClients) return;
      final pos = _scroll.position;
      final m = DateTime(d.year, d.month);
      final top = _offsetOf(m) + _headH + ((_lead(m) + d.day - 1) ~/ 7) * _cellH;
      var to = pos.pixels;
      if (top - _headH < to) {
        to = top - _headH;
      } else if (top + _cellH > to + pos.viewportDimension) {
        to = top + _cellH - pos.viewportDimension;
      }
      if (to != pos.pixels) _scroll.jumpTo(to.clamp(pos.minScrollExtent, pos.maxScrollExtent));
    });
  }

  void _pick(DateTime d) {
    if (_off(d)) return;
    setState(() {
      _dp = '';
      _custom = true;
      _focus = d;
      if (!_pickingEnd || _ds == null || d.isBefore(_ds!)) {
        _ds = d;
        _de = null;
        _pickingEnd = true;
      } else {
        _de = d;
        _pickingEnd = false;
      }
      _syncText();
    });
  }

  void _applyPreset(_Listed p) {
    setState(() {
      _ds = DateUtils.dateOnly(p.range.start);
      _de = DateUtils.dateOnly(p.range.end);
      _dp = p.key;
      _custom = false;
      _pickingEnd = false;
      _focus = _clampDay(_de!);
      _syncText();
    });
    _scrollTo(_ds!);
  }

  void _pickCustom() {
    setState(() {
      _custom = true;
      _dp = '';
      _pickingEnd = false;
    });
    _grid.requestFocus();
  }

  /// The date typed in a box: null for an empty box, [_bad] for text that isn't an available date.
  static final _bad = DateTime(0);
  DateTime? _typed(bool start) {
    final text = (start ? _startText : _endText).text.trim();
    if (text.isEmpty) return null;
    final d = MaterialLocalizations.of(context).parseCompactDate(text);
    return d == null || _off(DateUtils.dateOnly(d)) ? _bad : DateUtils.dateOnly(d);
  }

  bool _isBad(bool start) => identical(_typed(start), _bad);

  /// Reads a typed start or end date into the draft (Enter, leaving the box, or Apply). Text that isn't a date stays,
  /// marked invalid. An end before the start swaps them.
  void _commit(bool start) {
    if (!mounted) return;
    final d = _typed(start);
    if (identical(d, _bad)) {
      setState(() {});
      return;
    }
    final cur = start ? _ds : _de;
    if (d == null ? cur == null : _sameDay(d, cur)) {
      // Same date (perhaps written another way): just tidy the text.
      if (d != null) (start ? _startText : _endText).text = _format(d);
      return;
    }
    final oldStart = _ds;
    setState(() {
      _custom = true;
      _dp = '';
      if (start) {
        _ds = d;
        if (d != null && _de != null && _de!.isBefore(d)) _de = null;
      } else if (d != null && _ds != null && d.isBefore(_ds!)) {
        _de = _ds;
        _ds = d;
      } else {
        _de = d;
      }
      _pickingEnd = _ds != null && _de == null;
      if (d != null) _focus = d;
      _syncText();
    });
    if (_ds != null && !_sameDay(_ds, oldStart)) _scrollTo(_ds!);
  }

  /// Apply is possible: both boxes hold available dates (typed or from the draft).
  bool get _canApply => _typed(true) != null && _typed(false) != null && !_isBad(true) && !_isBad(false);

  void _apply() {
    // Text typed without Enter counts, as leaving the box would.
    if (_startText.text != _format(_ds)) _commit(true);
    if (_endText.text != _format(_de)) _commit(false);
    if (_ds == null || _de == null || _isBad(true) || _isBad(false)) return;
    Navigator.of(context).pop(_RangeResult(DateTimeRange(start: _ds!, end: _de!), _custom ? '' : (_dp.isEmpty ? null : _dp)));
  }

  KeyEventResult _onGridKey(FocusNode node, KeyEvent e) {
    if (e is! KeyDownEvent && e is! KeyRepeatEvent) return KeyEventResult.ignored;
    final next = _gridKeyTarget(context, e.logicalKey, _focus, widget.firstDay);
    if (next != null) {
      setState(() => _focus = _clampDay(next));
      _reveal(_focus);
      return KeyEventResult.handled;
    }
    final k = e.logicalKey;
    if (k == LogicalKeyboardKey.enter || k == LogicalKeyboardKey.numpadEnter || k == LogicalKeyboardKey.space) {
      _pick(_focus);
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  String _mark(DateTime d) => _rangeMark(d, _ds, _de ?? (_pickingEnd && _ds != null ? (_hover ?? _focus) : null));

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final s = CmStrings.of(context);
    final l = MaterialLocalizations.of(context);
    final narrow = cmIsNarrow(context);
    final screen = MediaQuery.sizeOf(context);
    final listed = _listed;
    final thisYear = widget.today.year;

    // The pressed preset: the draft's. A key wins over matching dates.
    final keyed = !_custom && _dp.isNotEmpty && listed.any((p) => p.key == _dp);
    bool pressed(_Listed p) => !_custom && (keyed ? p.key == _dp : _sameDay(p.range.start, _ds) && _sameDay(p.range.end, _de));
    final customPressed = _custom || (!listed.any(pressed) && (_ds != null || _de != null));

    Widget item(String id, String label, String? span, bool on, VoidCallback onTap) {
      final radius = BorderRadius.circular(narrow ? CmRadius.full : CmRadius.sm);
      final box = Container(
        constraints: const BoxConstraints(minHeight: CmControlHeight.sm),
        width: narrow ? null : double.infinity,
        padding: EdgeInsets.symmetric(horizontal: CmSpace.s12, vertical: narrow ? CmSpace.s4 : CmSpace.s8),
        alignment: narrow ? Alignment.center : AlignmentDirectional.centerStart,
        decoration: narrow
            ? BoxDecoration(color: on ? c.actionPrimary : null, border: Border.all(color: on ? c.actionPrimary : c.borderSubtle), borderRadius: radius)
            : BoxDecoration(color: on ? c.bgSelected : null, borderRadius: radius),
        child: narrow
            ? Text(label, maxLines: 1, style: CmType.bodyMd.copyWith(color: on ? c.actionPrimaryText : c.textDefault))
            : Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: CmType.bodyMd.copyWith(color: c.textDefault, fontWeight: on ? FontWeight.w600 : null)),
                  if (span != null)
                    Text(
                      span,
                      key: ValueKey('cm-preset-span-$id'),
                      style: CmType.bodyXs.copyWith(color: on ? c.textDefault : c.textTertiary, fontFeatures: const [FontFeature.tabularFigures()]),
                    ),
                ],
              ),
      );
      return Semantics(
        button: true,
        selected: on,
        label: span == null || narrow ? label : '$label, $span',
        excludeSemantics: true,
        onTap: onTap,
        child: InkWell(
          key: ValueKey('cm-preset-$id'),
          onTap: onTap,
          borderRadius: radius,
          child: narrow || !on
              ? box
              : Stack(children: [
                  box,
                  // The selected preset's tab-indicator bar at the start edge.
                  PositionedDirectional(
                    start: 0,
                    top: CmSpace.s8,
                    bottom: CmSpace.s8,
                    child: Container(
                      key: const ValueKey('cm-preset-indicator'),
                      width: 3,
                      decoration: BoxDecoration(color: c.tabIndicator, borderRadius: BorderRadius.circular(CmRadius.full)),
                    ),
                  ),
                ]),
        ),
      );
    }

    final items = <Widget>[
      if (_hasCustom) item('custom', s.presetCustom, null, customPressed, _pickCustom),
      for (final p in listed)
        item(
          p.key.isEmpty ? p.preset.label : p.key,
          p.preset.labelIn(s),
          _rangeSpan(s, p.range.start, p.range.end, year: p.range.start.year != thisYear || p.range.end.year != thisYear),
          pressed(p),
          () => _applyPreset(p),
        ),
    ];

    Widget presetList;
    if (narrow) {
      presetList = SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: CmSpace.s12, vertical: CmSpace.s8),
        child: Row(children: [
          for (var i = 0; i < items.length; i++) ...[if (i > 0) const SizedBox(width: CmSpace.s4), items[i]],
        ]),
      );
    } else {
      presetList = Container(
        width: 208,
        decoration: BoxDecoration(border: BorderDirectional(end: BorderSide(color: c.borderSubtle))),
        child: ListView(
          padding: const EdgeInsets.all(CmSpace.s8),
          children: [
            for (var i = 0; i < items.length; i++)
              if (i == 0 && _hasCustom)
                Container(
                  padding: const EdgeInsets.only(bottom: CmSpace.s8),
                  margin: const EdgeInsets.only(bottom: CmSpace.s8),
                  decoration: BoxDecoration(border: Border(bottom: BorderSide(color: c.borderSubtle))),
                  child: items[i],
                )
              else
                items[i],
          ],
        ),
      );
    }
    presetList = Semantics(container: true, explicitChildNodes: true, label: s.presetRanges, child: presetList);

    Widget box(bool start) {
      final bad = _isBad(start);
      OutlineInputBorder border(Color color, [double w = 1]) =>
          OutlineInputBorder(borderRadius: BorderRadius.circular(CmRadius.sm), borderSide: BorderSide(color: color, width: w));
      return Expanded(
        child: MergeSemantics(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(start ? s.dateRangeStart : s.dateRangeEnd, style: CmType.bodyXs.copyWith(color: c.textSecondary)),
              const SizedBox(height: CmSpace.s4),
              TextField(
                key: ValueKey(start ? 'cm-report-start' : 'cm-report-end'),
                controller: start ? _startText : _endText,
                focusNode: start ? _startFocus : _endFocus,
                keyboardType: TextInputType.datetime,
                autocorrect: false,
                style: CmType.bodyMd.copyWith(color: c.textDefault, fontFeatures: const [FontFeature.tabularFigures()]),
                decoration: InputDecoration(
                  isDense: true,
                  hintText: l.dateHelpText,
                  constraints: const BoxConstraints(minHeight: CmControlHeight.md, maxHeight: CmControlHeight.md),
                  contentPadding: const EdgeInsets.symmetric(horizontal: CmSpace.s8, vertical: 8),
                  enabledBorder: bad ? border(c.borderCritical) : null,
                  focusedBorder: bad ? border(c.borderCritical, 2) : null,
                ),
                onChanged: (_) => setState(() {}),
                onSubmitted: (_) => _commit(start),
              ),
            ],
          ),
        ),
      );
    }

    final inputs = Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
      box(true),
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: CmSpace.s8, vertical: CmSpace.s8),
        child: ExcludeSemantics(child: Text('–', style: CmType.bodyMd.copyWith(color: c.textTertiary))),
      ),
      box(false),
    ]);

    final fd = widget.firstDay;
    final week = ExcludeSemantics(
      child: Container(
        height: _weekH,
        decoration: BoxDecoration(border: Border(bottom: BorderSide(color: c.borderSubtle))),
        child: Row(children: [
          for (var k = 0; k < 7; k++)
            Expanded(child: Center(child: Text(l.narrowWeekdays[(k + fd) % 7], style: CmType.bodyXs.copyWith(color: c.textTertiary)))),
        ]),
      ),
    );

    final focusOn = _grid.hasFocus;
    Widget grid(DateTime m) {
      final lead = _lead(m);
      final days = DateUtils.getDaysInMonth(m.year, m.month);
      final cells = <DateTime?>[...List.filled(lead, null), for (var d = 1; d <= days; d++) DateTime(m.year, m.month, d)];
      while (cells.length % 7 != 0) {
        cells.add(null);
      }
      return Column(children: [
        for (var w = 0; w < cells.length; w += 7)
          Row(children: [
            for (var k = w; k < w + 7; k++)
              Expanded(
                child: cells[k] == null
                    ? const SizedBox(height: _cellH)
                    : _rangeDay(
                        context,
                        d: cells[k]!,
                        today: widget.today,
                        off: _off(cells[k]!),
                        mark: _mark(cells[k]!),
                        focused: focusOn && DateUtils.isSameDay(cells[k], _focus),
                        height: _cellH,
                        onTap: () => _pick(cells[k]!),
                        onHover: () {
                          if (_pickingEnd) setState(() => _hover = cells[k]);
                        },
                      ),
              ),
          ]),
      ]);
    }

    final months = Focus(
      focusNode: _grid,
      autofocus: true,
      onKeyEvent: _onGridKey,
      child: CustomScrollView(
        key: const ValueKey('cm-report-months'),
        controller: _scroll,
        slivers: [
          for (final m in _months)
            SliverMainAxisGroup(slivers: [
              SliverPersistentHeader(
                pinned: true,
                delegate: _MonthHeading(l.formatMonthYear(m), c, ValueKey('cm-month-${m.year}-${m.month}')),
              ),
              SliverToBoxAdapter(child: grid(m)),
            ]),
        ],
      ),
    );

    final status = _pickingEnd && _ds != null ? s.dateRangeChooseEnd(l.formatMediumDate(_ds!)) : s.dateRangeChooseStart;
    final count = _ds != null && _de != null
        ? DateTime.utc(_de!.year, _de!.month, _de!.day).difference(DateTime.utc(_ds!.year, _ds!.month, _ds!.day)).inDays + 1
        : 0;
    final draftStyle = CmType.bodyMd.copyWith(color: c.textDefault, fontFeatures: const [FontFeature.tabularFigures()]);
    final draft = Text.rich(
      key: const ValueKey('cm-range-draft'),
      _ds != null && _de != null
          ? TextSpan(children: [
              TextSpan(text: _rangeSpan(s, _ds!, _de, year: true)),
              TextSpan(text: ' · ${s.dateRangeDayCount(count)}', style: TextStyle(color: c.textTertiary)),
            ])
          : TextSpan(text: _ds != null ? '${_rangeSpan(s, _ds!, null, year: true)} –' : s.dateRangeNoDates),
      style: draftStyle,
    );
    final cancel = CmButton(label: s.dateRangeCancel, onPressed: () => Navigator.of(context).pop());
    final apply = CmButton(label: s.dateRangeApply, variant: CmButtonVariant.primary, onPressed: _canApply ? _apply : null);
    final footer = Container(
      padding: const EdgeInsets.symmetric(horizontal: CmSpace.s16, vertical: CmSpace.s12),
      decoration: BoxDecoration(border: Border(top: BorderSide(color: c.borderSubtle))),
      child: narrow
          ? Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: [
              draft,
              const SizedBox(height: CmSpace.s8),
              Row(mainAxisAlignment: MainAxisAlignment.end, children: [cancel, const SizedBox(width: CmSpace.s8), apply]),
            ])
          : Row(children: [Expanded(child: draft), cancel, const SizedBox(width: CmSpace.s8), apply]),
    );
    // Read by screen readers only, like the web's visually hidden status line.
    final live = SizedBox(height: 0, child: OverflowBox(maxHeight: 40, child: Opacity(opacity: 0, child: Semantics(liveRegion: true, child: Text(status)))));

    Widget content;
    if (narrow) {
      // The popup content scrolls so the footer stays visible; the months list is at most 40% of the screen.
      content = Column(mainAxisSize: MainAxisSize.min, children: [
        Flexible(
          child: SingleChildScrollView(
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: [
              presetList,
              Padding(
                padding: const EdgeInsets.fromLTRB(CmSpace.s16, CmSpace.s4, CmSpace.s16, 0),
                child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: [
                  inputs,
                  const SizedBox(height: CmSpace.s12),
                  week,
                  SizedBox(height: (screen.height * 0.4).clamp(120.0, 312.0), child: months),
                  live,
                ]),
              ),
            ]),
          ),
        ),
        footer,
      ]);
    } else {
      final bodyH = (screen.height - 2 * CmSpace.s16 - 64 - 2).clamp(240.0, 456.0);
      content = Column(mainAxisSize: MainAxisSize.min, children: [
        SizedBox(
          height: bodyH,
          child: Row(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            presetList,
            Container(
              width: 312,
              padding: const EdgeInsets.fromLTRB(CmSpace.s16, CmSpace.s16, CmSpace.s16, 0),
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                inputs,
                const SizedBox(height: CmSpace.s12),
                week,
                Expanded(child: months),
                live,
              ]),
            ),
          ]),
        ),
        SizedBox(width: 208 + 312, child: footer),
      ]);
    }

    return Dialog(
      backgroundColor: c.bgSurface,
      surfaceTintColor: Colors.transparent,
      insetPadding: const EdgeInsets.all(CmSpace.s16),
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(CmRadius.md), side: BorderSide(color: c.borderSubtle)),
      child: Semantics(label: s.chooseDates, child: content),
    );
  }
}

/// A month heading in the report popup's list: stays at the top while its month scrolls under it.
class _MonthHeading extends SliverPersistentHeaderDelegate {
  const _MonthHeading(this.text, this.colors, this.key);
  final String text;
  final CmColors colors;
  final Key key;

  @override
  double get minExtent => _ReportPanelState._headH;
  @override
  double get maxExtent => _ReportPanelState._headH;

  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) => Container(
        key: key,
        color: colors.bgSurface,
        padding: const EdgeInsets.fromLTRB(CmSpace.s4, CmSpace.s12, CmSpace.s4, CmSpace.s4),
        alignment: AlignmentDirectional.bottomStart,
        child: Semantics(
          header: true,
          child: Text(text, style: CmType.bodySm.copyWith(fontWeight: FontWeight.w600, color: colors.textDefault)),
        ),
      );

  @override
  bool shouldRebuild(_MonthHeading old) => old.text != text || old.colors != colors;
}
