import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';

import 'button.dart';
import 'display.dart';
import 'forms.dart';
import 'generated/icons.g.dart';
import 'generated/tokens.g.dart';
import 'icon.dart';
import 'lists.dart';
import 'strings.dart';
import 'theme.dart';

/// How a [CmDataTableColumn]'s values are compared and laid out.
enum CmDataColumnType {
  /// Compared as text, numbers inside it in number order ("Size 2" before "Size 10").
  text,

  /// Right-aligned with tabular figures, sorted by value.
  numeric,

  /// Like [numeric], for amounts such as "Rs. 1,200": the currency is skipped when sorting.
  money,

  /// Sorted by date: [DateTime]s, milliseconds since the epoch or ISO 8601 strings.
  date,

  /// Buttons for each row ([CmDataTableColumn.actions]), right-aligned, with the heading for screen readers only.
  /// Since 1.7 (web 1.6).
  actions,
}

/// Which columns the [CmDataTableMobile.priority] layout keeps on narrow widths. Since 1.7 (web 1.6).
enum CmColumnPriority { high, low }

/// When a [CmDataTable]'s row actions show. Since 1.7 (web 1.6).
enum CmRowActions {
  /// On hover and while the row has focus on desktops (still in the tab order and read by screen readers); always on
  /// touch screens. The default.
  hover,

  /// Always shown.
  always,
}

/// A button in an actions column ([CmDataColumnType.actions]). Mirrors the web's `DataTableAction`. Since 1.7.
@immutable
class CmDataTableAction {
  const CmDataTableAction({required this.label, this.value, this.icon, this.iconOnly = false, this.critical = false})
      : assert(!iconOnly || icon != null, 'An icon-only action needs an icon.');

  /// Button text, e.g. "Edit". With [iconOnly], the accessible name (the row's name is added for screen readers).
  final String label;

  /// Identifies the action in [CmDataTable.onRowAction]. Defaults to [label].
  final String? value;

  /// Icon name from [CmIcons], shown before the label.
  final String? icon;

  /// Shows only the icon.
  final bool iconOnly;

  /// Red, for destructive actions such as Delete.
  final bool critical;
}

/// Whether [CmDataTable] sorts its own rows.
enum CmDataTableSortMode {
  /// The table sorts its rows and reports the new order through [CmDataTable.onSort].
  auto,

  /// The table only calls [CmDataTable.onSort]: sort on your server, then pass the new
  /// [CmDataTable.rows], [CmDataTable.sortKey] and [CmDataTable.direction].
  manual,
}

/// How a [CmDataTable] shows on narrow widths (640px or less, judged by the table's own width). Since 1.6.
enum CmDataTableMobile {
  /// Keeps the columns and scrolls sideways. The default.
  scroll,

  /// Each row becomes a card: the first column as its title, then label and value pairs.
  cards,

  /// Hides [CmColumnPriority.low] columns and gives each row a "View all fields" button that shows them. Since 1.7.
  priority,
}

/// One column of a [CmDataTable].
@immutable
class CmDataTableColumn {
  const CmDataTableColumn({
    required this.key,
    required this.label,
    this.type = CmDataColumnType.text,
    this.sortable = false,
    this.align,
    this.hidden = false,
    this.visible = true,
    this.priority = CmColumnPriority.high,
    this.primary = false,
    this.width,
    this.actions = const [],
    this.lines,
  });

  /// The key of each row's value shown in this column, and the key passed to [CmDataTable.onSort].
  final String key;

  /// Column heading.
  final String label;
  final CmDataColumnType type;

  /// Lets the merchant sort by this column.
  final bool sortable;

  /// Text alignment. Default: [TextAlign.end] for numeric and money columns, otherwise [TextAlign.start].
  final TextAlign? align;

  /// Heading for screen readers only, e.g. for an actions column. (It does not hide the column: see [visible].)
  final bool hidden;

  /// False leaves the column out. The column picker ([CmDataTable.columnPicker]) lists it, unticked. Since 1.7.
  final bool visible;

  /// [CmColumnPriority.low]: hidden on narrow widths with [CmDataTableMobile.priority]. Since 1.7.
  final CmColumnPriority priority;

  /// The column that names each row: its cells are row headings and card titles. Default: the first column. Since 1.7.
  final bool primary;

  /// Starting width in pixels. Text that doesn't fit ends in "…". Null: sized to the content. Since 1.7.
  final double? width;

  /// With [CmDataColumnType.actions]: the buttons in every row. A row can list its own as a `List<CmDataTableAction>`
  /// under the column's key. Since 1.7.
  final List<CmDataTableAction> actions;

  /// Text cells wrap onto up to this many lines, then end in "…", instead of staying on one line (the row grows to
  /// fit). Use it for long notes or lists of signals. The full value shows in a tooltip and is always read by screen
  /// readers. Null or 1: one line. Since 1.7.
  final int? lines;

  /// A copy with [visible] or [width] changed.
  CmDataTableColumn copyWith({bool? visible, double? width}) => CmDataTableColumn(
        key: key, label: label, type: type, sortable: sortable, align: align, hidden: hidden, visible: visible ?? this.visible,
        priority: priority, primary: primary, width: width ?? this.width, actions: actions, lines: lines,
      );

  bool get _isActions => type == CmDataColumnType.actions;

  /// Lines a text cell may take: 1 unless [lines] is more.
  int get _lines => type == CmDataColumnType.text && (lines ?? 1) > 1 ? lines! : 1;

  bool get _end {
    final a = align ?? (type == CmDataColumnType.numeric || type == CmDataColumnType.money || type == CmDataColumnType.actions ? TextAlign.end : TextAlign.start);
    return a == TextAlign.end || a == TextAlign.right;
  }
}

/// A data table for reports and read-only lists: sales by day, stock by location, order lines.
/// Column headings, sortable columns, a totals row, a sticky header and first column, loading rows and
/// an empty state. For lists merchants select and act on, use [CmResourceList]. Mirrors `<cm-data-table>`.
///
/// Rows are maps from column keys to values, shown as text. On widths narrower than the table, it
/// scrolls sideways ([mobile]: or turns each row into a card at 640px or less). Every sort is announced to screen
/// readers ("Sorted by Net sales, descending").
///
/// The table standard (owner standard, 1.6): a 40px heading row in 12px semibold; 48px body rows ([density]
/// compact: 40; at least 44 on touch screens), cells padded 12 across and 10 down in 13px text; numbers and money
/// right-aligned with tabular figures; dates and numbers never wrap; a text value longer than 320px (or 45% of the
/// table) ends in an ellipsis, with the full value in a tooltip and for screen readers.
class CmDataTable extends StatefulWidget {
  const CmDataTable({
    super.key,
    required this.columns,
    required this.rows,
    required this.caption,
    this.totals,
    this.captionHidden = false,
    this.sortKey,
    this.direction = CmSortDirection.ascending,
    this.sortMode = CmDataTableSortMode.auto,
    this.onSort,
    this.stickyHeader = false,
    this.maxHeight,
    this.stickyFirstColumn = false,
    this.loading = false,
    this.loadingRows = 5,
    this.empty,
    this.density = CmDensity.comfortable,
    this.mobile = CmDataTableMobile.scroll,
    this.rowActions = CmRowActions.hover,
    this.onRowAction,
    this.resizable = false,
    this.onColumnResize,
    this.columnPicker = false,
    this.onColumnsChange,
  });

  /// The columns, in order.
  final List<CmDataTableColumn> columns;

  /// The rows: maps keyed by column [CmDataTableColumn.key].
  final List<Map<String, Object?>> rows;

  /// A totals row shown at the bottom, keyed like a row. Leave a key out for an empty cell.
  final Map<String, Object?>? totals;

  /// What the table shows, e.g. "Sales by day". It names the table for screen readers.
  final String caption;

  /// Keeps the caption for screen readers but hides it, when a card or page heading already says it.
  final bool captionHidden;

  /// Key of the sorted column. Null: rows stay in the order given. Changing it re-sorts.
  final String? sortKey;

  /// Direction of the sorted column.
  final CmSortDirection direction;
  final CmDataTableSortMode sortMode;

  /// Called when a sortable heading is pressed, with the column key and the new direction.
  final void Function(String key, CmSortDirection direction)? onSort;

  /// Keeps the heading row visible while the rows scroll inside [maxHeight].
  final bool stickyHeader;

  /// With [stickyHeader], the rows scroll inside this height.
  final double? maxHeight;

  /// Keeps the first column visible while the table scrolls sideways (on narrow screens).
  final bool stickyFirstColumn;

  /// Shows placeholder rows.
  final bool loading;

  /// How many placeholder rows [loading] shows.
  final int loadingRows;

  /// Shown instead of the rows when [rows] is empty, e.g. a [CmEmptyState]. Default "No data".
  final Widget? empty;

  /// Row height: comfortable 48, compact 40. Since 1.6.
  final CmDensity density;

  /// The layout at 640px wide or less: keep scrolling sideways (with a "Scroll for more" hint while there is more),
  /// show each row as a card, or hide low-priority columns behind "View all fields". Since 1.6.
  final CmDataTableMobile mobile;

  /// When the buttons of an actions column show: on hover and focus (always on touch screens), or always. Since 1.7.
  final CmRowActions rowActions;

  /// Called when a row action is pressed, with the action's value (its label by default), the row and its index in
  /// [rows]. Since 1.7.
  final void Function(String action, Map<String, Object?> row, int index)? onRowAction;

  /// Adds a resize handle to each heading: drag it, or focus it and press ← and → (16px a press). Each new width is
  /// announced ("Customer column, 240 pixels wide"). Since 1.7.
  final bool resizable;

  /// Called with the column key and its new width after a resize. Store it to keep the width next time.
  final void Function(String key, double width)? onColumnResize;

  /// Adds a "Columns" button above the table that lists every column with a checkbox, to show or hide it (the row's
  /// naming column can't be hidden). Since 1.7.
  final bool columnPicker;

  /// Called after the merchant shows or hides a column, with every column (their [CmDataTableColumn.visible] updated),
  /// the column key and whether it is now visible. Store it to keep the choice. The table keeps the change itself
  /// until you pass new [columns].
  final void Function(List<CmDataTableColumn> columns, String key, bool visible)? onColumnsChange;

  /// Widest a text cell gets before it ends in an ellipsis (also at most 45% of the table's width).
  static const double cellMaxWidth = 320;

  /// Reads a number from a cell: 1200, "1,200", "Rs. 1,200", "₹1,200.50", "-500", "(500)" (negative), "12%".
  /// Leading text such as a currency is skipped, so the dot in "Rs." is never read as a decimal point.
  static double toNumber(Object? v) {
    if (v is num) return v.toDouble();
    final text = (v ?? '').toString().trim();
    final negative = RegExp(r'^\(.*\)$').hasMatch(text) || RegExp(r'^-|^[^\d]*-\s*\d').hasMatch(text);
    final m = RegExp(r'\d[\d,]*(?:\.\d+)?').firstMatch(text);
    if (m == null) return double.nan;
    final n = double.parse(m.group(0)!.replaceAll(',', ''));
    return negative ? -n : n;
  }

  static bool _empty(Object? v) => v == null || (v is String && v.isEmpty);

  static int? _time(Object? v) => v is DateTime ? v.millisecondsSinceEpoch : v is num ? v.toInt() : DateTime.tryParse(v.toString())?.millisecondsSinceEpoch;

  /// Compares two non-empty values the way a column of [type] sorts.
  static int compare(Object? a, Object? b, CmDataColumnType type) {
    switch (type) {
      case CmDataColumnType.numeric:
      case CmDataColumnType.money:
        double n(Object? v) { final x = toNumber(v); return x.isNaN ? 0 : x; }
        return n(a).compareTo(n(b));
      case CmDataColumnType.date:
        return (_time(a) ?? 0).compareTo(_time(b) ?? 0);
      case CmDataColumnType.text:
        return _natural(a.toString(), b.toString());
      case CmDataColumnType.actions:
        return 0;
    }
  }

  /// Case-insensitive, with runs of digits compared as numbers.
  static int _natural(String a, String b) {
    final re = RegExp(r'\d+|\D+');
    final pa = re.allMatches(a.toLowerCase()).map((m) => m.group(0)!).toList();
    final pb = re.allMatches(b.toLowerCase()).map((m) => m.group(0)!).toList();
    for (var i = 0; i < pa.length && i < pb.length; i++) {
      final x = pa[i], y = pb[i];
      final nx = int.tryParse(x), ny = int.tryParse(y);
      final r = nx != null && ny != null ? nx.compareTo(ny) : x.compareTo(y);
      if (r != 0) return r;
    }
    return pa.length.compareTo(pb.length);
  }

  /// [rows] sorted by the column [key] (stable; empty values stay last in both directions).
  static List<Map<String, Object?>> sortRows(List<Map<String, Object?>> rows, CmDataTableColumn column, CmSortDirection direction) {
    final sign = direction == CmSortDirection.descending ? -1 : 1;
    final indexed = [for (var i = 0; i < rows.length; i++) (rows[i], i)];
    indexed.sort((p, q) {
      final a = p.$1[column.key], b = q.$1[column.key];
      final ea = _empty(a), eb = _empty(b);
      if (ea || eb) return ea == eb ? p.$2 - q.$2 : (ea ? 1 : -1);
      final r = sign * compare(a, b, column.type);
      return r != 0 ? r : p.$2 - q.$2;
    });
    return [for (final p in indexed) p.$1];
  }

  /// How a value is written in a cell: text as is, dates as "9 Feb 2023". Month names come from [strings].
  static String format(Object? v, {CmStrings strings = const CmStrings()}) {
    if (v == null) return '';
    if (v is DateTime) {
      return '${v.day} ${strings.monthsShort[v.month - 1]} ${v.year}';
    }
    return v.toString();
  }

  @override
  State<CmDataTable> createState() => _CmDataTableState();
}

/// Narrowest a merchant can make a column.
const double _minWidth = 48;

/// Arrow keys on a resize handle change the width by this much.
const double _step = 16;

class _CmDataTableState extends State<CmDataTable> {
  late String? _sort = widget.sortKey;
  late CmSortDirection _dir = widget.direction;
  bool _awaitingManual = false;
  final _hBody = ScrollController(), _hHead = ScrollController(), _hFoot = ScrollController(), _v = ScrollController();

  /// Widths the merchant set by resizing, by column key.
  final _widths = <String, double>{};

  /// The columns with the merchant's picker choices applied; reset when the page passes new columns.
  late List<CmDataTableColumn> _columns = widget.columns;

  /// Rows whose low-priority fields are open (priority layout).
  final _expanded = <Map<String, Object?>>{};

  /// The row under the pointer and the row with focus, for row actions.
  int? _hoverRow, _focusRow;

  /// Whether there is more to scroll to at the end, for the scroll hint.
  final _moreEnd = ValueNotifier<bool>(false);
  final _pickerPortal = OverlayPortalController();
  final _pickerLink = LayerLink();
  final _pickerButton = FocusNode(debugLabel: 'CmDataTable columns');

  @override
  void initState() {
    super.initState();
    _hBody.addListener(() {
      for (final c in [_hHead, _hFoot]) {
        if (c.hasClients && c.offset != _hBody.offset) c.jumpTo(_hBody.offset.clamp(0, c.position.maxScrollExtent));
      }
      _measure();
    });
  }

  void _measure() {
    if (!_hBody.hasClients || !_hBody.position.hasContentDimensions) {
      _moreEnd.value = false;
      return;
    }
    final p = _hBody.position;
    _moreEnd.value = p.maxScrollExtent > 0 && p.pixels < p.maxScrollExtent - 1;
  }

  @override
  void didUpdateWidget(CmDataTable old) {
    super.didUpdateWidget(old);
    if (widget.sortKey != old.sortKey || widget.direction != old.direction) {
      _sort = widget.sortKey;
      _dir = widget.direction;
      // Manual mode: the page sorted and passed the new state back; announce it now.
      if (_awaitingManual && _sort != null) {
        _awaitingManual = false;
        _announce();
      }
    }
    if (!identical(widget.columns, old.columns)) {
      _columns = widget.columns;
      // A column given a new width by the app takes it over from an earlier resize.
      for (final c in widget.columns) {
        final before = old.columns.where((o) => o.key == c.key).firstOrNull;
        if (c.width != null && before?.width != c.width) _widths.remove(c.key);
      }
    }
  }

  @override
  void dispose() {
    for (final c in [_hBody, _hHead, _hFoot, _v]) {
      c.dispose();
    }
    _moreEnd.dispose();
    _pickerButton.dispose();
    super.dispose();
  }

  CmDataTableColumn? get _sortColumn {
    for (final c in _columns) {
      if (c.key == _sort) return c;
    }
    return null;
  }

  void _announce() {
    final col = _sortColumn;
    if (col == null) return;
    SemanticsService.announce(CmStrings.of(context).sortedBy(col.label, _dir == CmSortDirection.descending), Directionality.of(context));
  }

  void _onSort(CmDataTableColumn c) {
    final direction = _sort == c.key && _dir == CmSortDirection.ascending ? CmSortDirection.descending : CmSortDirection.ascending;
    widget.onSort?.call(c.key, direction);
    if (widget.sortMode == CmDataTableSortMode.manual) {
      _awaitingManual = true;
      return;
    }
    setState(() {
      _sort = c.key;
      _dir = direction;
    });
    _announce();
  }

  List<Map<String, Object?>> get _rows {
    final col = _sortColumn;
    if (col == null || widget.sortMode == CmDataTableSortMode.manual) return widget.rows;
    return CmDataTable.sortRows(widget.rows, col, _dir);
  }

  CmDataTableColumn? _primaryOf(List<CmDataTableColumn> cols) =>
      cols.where((c) => c.primary).firstOrNull ?? cols.where((c) => !c._isActions).firstOrNull ?? cols.firstOrNull;

  double? _widthOf(CmDataTableColumn c) => _widths[c.key] ?? c.width;

  void _setWidth(CmDataTableColumn c, double width, {required bool done}) {
    final w = width < _minWidth ? _minWidth : width.roundToDouble();
    setState(() => _widths[c.key] = w);
    if (!done) return;
    SemanticsService.announce(CmStrings.of(context).tableResized(c.label, w.round()), Directionality.of(context));
    widget.onColumnResize?.call(c.key, w);
  }

  void _setVisible(String key, bool visible) {
    setState(() => _columns = [for (final c in _columns) c.key == key ? c.copyWith(visible: visible) : c]);
    widget.onColumnsChange?.call(_columns, key, visible);
  }

  List<CmDataTableAction> _actionsOf(CmDataTableColumn c, Map<String, Object?> r) {
    final own = r[c.key];
    return own is List<CmDataTableAction> ? own : c.actions;
  }

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final s = CmStrings.of(context);
    final scaler = MediaQuery.textScalerOf(context);
    final touch = cmIsTouch(context);
    final rtl = Directionality.of(context) == TextDirection.rtl;
    final cellStyle = CmType.bodySm.copyWith(color: c.textDefault, fontFeatures: const [FontFeature.tabularFigures()]);
    final headStyle = CmType.bodyXs.copyWith(fontWeight: FontWeight.w600, color: c.textTertiary);
    final footStyle = cellStyle.copyWith(fontWeight: FontWeight.w500);
    final rows = _rows;
    final showEmpty = !widget.loading && rows.isEmpty;
    final showTotals = widget.totals != null && !widget.loading && !showEmpty;

    double measure(String s, TextStyle st) {
      if (s.isEmpty) return 0;
      final p = TextPainter(text: TextSpan(text: s, style: st), textDirection: TextDirection.ltr, textScaler: scaler, maxLines: 1)..layout();
      final w = p.width;
      p.dispose();
      return w;
    }

    bool wraps(CmDataTableColumn col) => col.type == CmDataColumnType.text;

    // A value wrapped at [width] onto at most [lines] lines: its height and whether it was cut short.
    ({double height, bool cut}) clamped(String s, TextStyle st, double width, int lines) {
      final p = TextPainter(text: TextSpan(text: s, style: st), textDirection: TextDirection.ltr, textScaler: scaler, maxLines: lines, ellipsis: '…')
        ..layout(maxWidth: width);
      final r = (height: p.height, cut: p.didExceedMaxLines);
      p.dispose();
      return r;
    }
    final actionStyle = CmType.bodySm.copyWith(fontSize: 13, fontWeight: FontWeight.w500);
    double actionsWidth(List<CmDataTableAction> list) {
      final h = cmButtonHeight(context, CmControlHeight.sm) + 2 * cmTouchSlop(context);
      var w = 0.0;
      for (var i = 0; i < list.length; i++) {
        final a = list[i];
        w += (i > 0 ? CmSpace.s8 : 0) + (a.iconOnly ? h : measure(a.label, actionStyle) + 2 * CmSpace.s12 + 2 + (a.icon != null ? CmIconSize.sm + CmSpace.s8 : 0) + 2 * cmTouchSlop(context));
      }
      return w;
    }

    // Natural widths: the widest heading, cell or total in each column, plus 12px padding each side. Text cells
    // are capped at cellMaxWidth (and 45% of the table, below); longer values end in an ellipsis.
    double naturalWidth(CmDataTableColumn col, double cap) {
      final fixed = _widthOf(col);
      if (fixed != null) return fixed < _minWidth ? _minWidth : fixed;
      double cell(double w) => wraps(col) && w > cap ? cap : w;
      if (col._isActions) {
        final widest = widget.loading ? 40.0 : [for (final r in rows) actionsWidth(_actionsOf(col, r))].fold<double>(0, (a, b) => a > b ? a : b);
        return 2 * CmSpace.s12 + 2 + widest;
      }
      // +2 for the heading's side borders and sub-pixel text widths.
      return 2 * CmSpace.s12 + 2 +
          [
            col.hidden ? 0.0 : measure(col.label, headStyle) + (col.sortable ? 16 : 0),
            if (!widget.loading) for (final r in rows) cell(measure(CmDataTable.format(r[col.key], strings: s), cellStyle)),
            if (showTotals) cell(measure(CmDataTable.format(widget.totals![col.key], strings: s), footStyle)),
            if (widget.loading) 40.0,
          ].fold<double>(0, (a, b) => a > b ? a : b);
    }

    final density = widget.density == CmDensity.compact ? 40.0 : 48.0;
    // 13/18 text with 10px above and below fits in 40; the row height wins when larger (and 44 on touch screens).
    final baseRowH = [cmControlHeight(context, density), scaler.scale(13) * 18 / 13 + 2 * 10 + 1].reduce((a, b) => a > b ? a : b);
    final headH = [CmControlHeight.lg, scaler.scale(12) * 16 / 12 + 2 * CmSpace.s8 + 2].reduce((a, b) => a > b ? a : b);

    final focusRing = BoxDecoration(border: Border.all(color: c.borderStrong, width: 2), borderRadius: BorderRadius.circular(CmRadius.xs));

    Widget table(BoxConstraints box) {
      final narrow = box.maxWidth <= 640;
      final all = _columns.where((col) => col.visible).toList();
      final primary = _primaryOf(all);
      final priority = widget.mobile == CmDataTableMobile.priority && narrow;
      final low = priority ? all.where((col) => col.priority == CmColumnPriority.low && col != primary).toList() : const <CmDataTableColumn>[];
      final cols = [for (final col in all) if (!low.contains(col)) col];
      final primaryIdx = primary == null ? -1 : cols.indexOf(primary);
      // The priority layout's rows are taller: the naming cell holds the "View all fields" button under the value.
      final moreH = low.isEmpty ? 0.0 : CmSpace.s24 + CmSpace.s4;
      final rowH = baseRowH + moreH;

      Widget headCell(int i, double w) {
        final col = cols[i];
        final first = i == 0, last = i == cols.length - 1;
        final side = BorderSide(color: c.borderSubtle);
        final on = col.key == _sort;
        final desc = on && _dir == CmSortDirection.descending;
        final hideLabel = col.hidden || col._isActions;
        Widget label = hideLabel
            ? Semantics(label: col.label, child: const SizedBox(width: 1, height: 18)) /* scale-exempt: the 18 line height of a 13px label */
            : Text(col.label, maxLines: 1, softWrap: false, overflow: TextOverflow.ellipsis, style: headStyle);
        if (col.sortable && !col._isActions) {
          label = _SortHeading(
            label: label,
            semanticLabel: '${col.label}, ${on ? (desc ? s.sortedDescending : s.sortedAscending) : s.sortable}',
            icon: CmIcon(desc ? CmIcons.chevronDown : CmIcons.chevronUp, size: 12, color: c.iconSelected),
            showIcon: on,
            iconFirst: col._end,
            focusRing: focusRing,
            onTap: () => _onSort(col),
          );
        } else if (!hideLabel) {
          label = Semantics(header: true, child: label);
        }
        Widget cell = Container(
          width: w,
          height: headH,
          padding: const EdgeInsets.symmetric(horizontal: CmSpace.s12),
          alignment: col._end ? AlignmentDirectional.centerEnd : AlignmentDirectional.centerStart,
          decoration: BoxDecoration(
            color: c.bgHover,
            border: Border(top: side, bottom: side, left: first ? side : BorderSide.none, right: last ? side : BorderSide.none),
            borderRadius: BorderRadius.only(
              topLeft: first ? const Radius.circular(CmRadius.md) : Radius.zero,
              topRight: last ? const Radius.circular(CmRadius.md) : Radius.zero,
            ),
          ),
          child: label,
        );
        if (widget.resizable && !col._isActions) {
          cell = Stack(children: [
            cell,
            PositionedDirectional(
              top: 0,
              bottom: 0,
              end: 0,
              child: _ResizeHandle(
                label: s.tableResize(col.label),
                width: w,
                rtl: rtl,
                onChange: (nw, done) => _setWidth(col, nw, done: done),
              ),
            ),
          ]);
        }
        return cell;
      }

      Widget cell(int i, double w, Widget child, {double? height}) => Container(
            width: w,
            height: height ?? rowH,
            padding: EdgeInsets.symmetric(horizontal: CmSpace.s12, vertical: cols[i]._isActions ? 0 : CmSpace.s8),
            alignment: cols[i]._end ? AlignmentDirectional.centerEnd : AlignmentDirectional.centerStart,
            decoration: BoxDecoration(color: c.bgSurface, border: Border(bottom: BorderSide(color: c.borderSubtle))),
            child: child,
          );

      // Widest a text cell's value gets: cellMaxWidth, or 45% of the table.
      final cap = box.maxWidth.isFinite ? (box.maxWidth * 0.45).clamp(0.0, CmDataTable.cellMaxWidth) : CmDataTable.cellMaxWidth;
      // Room for a text cell's value in a column [width] wide.
      double roomFor(double? width, bool fixed) {
        final inner = width == null ? cap : (width - 2 * CmSpace.s12 - 2).clamp(0.0, double.infinity);
        return fixed ? inner : inner.clamp(0.0, cap);
      }

      Widget text(Object? v, TextStyle st, {bool header = false, double? width, bool ellipsis = false, bool fixed = false, int lines = 1}) {
        final value = CmDataTable.format(v, strings: s);
        Widget t = Text(value, maxLines: lines, softWrap: lines > 1, overflow: ellipsis ? TextOverflow.ellipsis : TextOverflow.clip, style: st);
        if (ellipsis) {
          final room = roomFor(width, fixed);
          t = ConstrainedBox(constraints: BoxConstraints(maxWidth: room), child: t);
          // Cut short: the full value shows on hover and long press, and screen readers read it whole.
          if (lines > 1 ? clamped(value, st, room, lines).cut : measure(value, st) > room) {
            t = Tooltip(message: value, excludeFromSemantics: true, child: Semantics(label: value, excludeSemantics: true, child: t));
          }
        }
        return header ? Semantics(header: true, child: t) : t;
      }

      String rowName(Map<String, Object?> r) => primary == null ? '' : CmDataTable.format(r[primary.key], strings: s);

      Widget actionsCell(CmDataTableColumn col, Map<String, Object?> r, int index, {bool always = false}) {
        final name = rowName(r);
        final list = _actionsOf(col, r);
        Widget buttons = Row(mainAxisSize: MainAxisSize.min, spacing: CmSpace.s8, children: [
          for (final a in list)
            a.iconOnly
                ? CmButton.iconOnly(
                    icon: a.icon!,
                    label: s.tableRowAction(a.label, name),
                    size: CmButtonSize.slim,
                    tone: a.critical ? CmButtonTone.critical : null,
                    onPressed: () => widget.onRowAction?.call(a.value ?? a.label, r, widget.rows.indexOf(r)),
                  )
                : CmButton(
                    label: a.label,
                    icon: a.icon,
                    semanticLabel: name.isEmpty ? null : s.tableRowAction(a.label, name),
                    size: CmButtonSize.slim,
                    tone: a.critical ? CmButtonTone.critical : null,
                    onPressed: () => widget.onRowAction?.call(a.value ?? a.label, r, widget.rows.indexOf(r)),
                  ),
        ]);
        final shown = always || widget.rowActions == CmRowActions.always || touch || _hoverRow == index || _focusRow == index;
        // Hidden buttons stay in the tab order and the semantics tree, as on the web (opacity 0).
        return Opacity(opacity: shown ? 1 : 0, alwaysIncludeSemantics: true, child: buttons);
      }

      Widget content(int i, Map<String, Object?> r, int index, double w) {
        final col = cols[i];
        if (col._isActions) return actionsCell(col, r, index);
        final value = text(r[col.key], cellStyle, header: i == primaryIdx, width: w, ellipsis: wraps(col), fixed: _widthOf(col) != null, lines: col._lines);
        if (i != primaryIdx || low.isEmpty) return value;
        final open = _expanded.contains(r);
        return Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          value,
          const SizedBox(height: CmSpace.s4),
          _TextButton(
            label: open ? s.tableViewLess : s.tableViewAll,
            expanded: open,
            onTap: () => setState(() => open ? _expanded.remove(r) : _expanded.add(r)),
          ),
        ]);
      }

      Widget details(Map<String, Object?> r, double width) => Container(
            width: width,
            padding: const EdgeInsets.symmetric(horizontal: CmSpace.s12, vertical: CmSpace.s8),
            decoration: BoxDecoration(color: c.bgHover, border: Border(bottom: BorderSide(color: c.borderSubtle))),
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, spacing: CmSpace.s4, children: [
              for (final col in low)
                MergeSemantics(
                  child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Expanded(flex: 2, child: Text(col.label, style: CmType.bodyXs.copyWith(color: c.textTertiary))),
                    const SizedBox(width: CmSpace.s12),
                    Expanded(
                      flex: 3,
                      child: Text(CmDataTable.format(r[col.key], strings: s), textAlign: col._end ? TextAlign.end : TextAlign.start, style: cellStyle),
                    ),
                  ]),
                ),
            ]),
          );

      /// Tracks hover and focus for a row's actions.
      Widget rowShell(int index, Widget child) => MouseRegion(
            onEnter: (_) => setState(() => _hoverRow = index),
            onExit: (_) {
              if (_hoverRow == index) setState(() => _hoverRow = null);
            },
            child: Focus(
              canRequestFocus: false,
              skipTraversal: true,
              onFocusChange: (f) => setState(() => f ? _focusRow = index : (_focusRow == index ? _focusRow = null : null)),
              child: child,
            ),
          );

      final natural = [for (final col in cols) naturalWidth(col, cap)];
      final total = natural.fold<double>(0, (a, b) => a + b);
      final avail = box.maxWidth.isFinite ? box.maxWidth : total;
      // Wider than needed: share the extra space among the columns without a set width, in proportion, as a
      // 100%-wide table does.
      final flexTotal = [for (var i = 0; i < cols.length; i++) if (_widthOf(cols[i]) == null && !cols[i]._isActions) natural[i]].fold<double>(0, (a, b) => a + b);
      final w = total >= avail || total == 0 || flexTotal == 0
          ? natural
          : [for (var i = 0; i < cols.length; i++) _widthOf(cols[i]) == null && !cols[i]._isActions ? natural[i] + (avail - total) * natural[i] / flexTotal : natural[i]];
      final idx = [for (var i = 0; i < cols.length; i++) i];
      final tableW = w.fold<double>(0, (a, b) => a + b);

      // Rows with multi-line cells ([CmDataTableColumn.lines]) grow to fit them: 10 above and below, plus the border.
      double heightOf(Map<String, Object?> r) {
        var h = rowH;
        for (var i = 0; i < cols.length; i++) {
          final col = cols[i];
          if (col._lines < 2) continue;
          final value = CmDataTable.format(r[col.key], strings: s);
          if (value.isEmpty) continue;
          final need = clamped(value, cellStyle, roomFor(w[i], _widthOf(col) != null), col._lines).height + 2 * 10 + 1 + (i == primaryIdx ? moreH : 0);
          if (need > h) h = need;
        }
        return h;
      }

      Widget head(List<int> ix) => Row(children: [for (final i in ix) headCell(i, w[i])]);
      List<Widget> body(List<int> ix, {bool withDetails = false}) => widget.loading
          ? [
              for (var r = 0; r < (widget.loadingRows < 1 ? 1 : widget.loadingRows); r++)
                Row(children: [for (final i in ix) cell(i, w[i], const CmSkeleton(width: 40), height: baseRowH)]),
            ]
          : [
              for (var ri = 0; ri < rows.length; ri++) ...[
                // The naming cell names the row, as a row heading does on the web.
                rowShell(ri, Row(children: [for (final i in ix) cell(i, w[i], content(i, rows[ri], ri, w[i]), height: heightOf(rows[ri]))])),
                if (withDetails && _expanded.contains(rows[ri])) details(rows[ri], tableW),
              ],
            ];
      Widget? foot(List<int> ix) => showTotals
          ? Row(children: [
              for (final i in ix)
                cell(i, w[i], cols[i]._isActions ? const SizedBox.shrink() : text(widget.totals![cols[i].key], footStyle, width: w[i], ellipsis: wraps(cols[i]), fixed: _widthOf(cols[i]) != null), height: baseRowH),
            ])
          : null;

      Widget vertical(Widget child) => widget.stickyHeader && widget.maxHeight != null
          ? ConstrainedBox(
              constraints: BoxConstraints(maxHeight: widget.maxHeight!),
              child: SingleChildScrollView(controller: _v, child: child),
            )
          : child;

      final emptyRow = Container(
        width: (total >= avail ? total : avail),
        padding: const EdgeInsets.all(CmSpace.s20),
        child: DefaultTextStyle.merge(style: cellStyle, child: widget.empty ?? Text(s.noData, style: cellStyle)),
      );

      // After layout: is there more to scroll to? (The hint shows only with the scroll layout.)
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _measure();
      });

      if (!widget.stickyFirstColumn || cols.length < 2 || low.isNotEmpty) {
        final footer = foot(idx);
        return SingleChildScrollView(
          controller: _hBody,
          scrollDirection: Axis.horizontal,
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            head(idx),
            vertical(Column(crossAxisAlignment: CrossAxisAlignment.start, children: [...body(idx, withDetails: low.isNotEmpty), if (showEmpty) emptyRow])),
            ?footer,
          ]),
        );
      }

      // Sticky first column: it stays put while the other columns scroll sideways together.
      final rest = idx.sublist(1);
      Widget side(ScrollController ctrl, Widget child, {bool user = false}) => Expanded(
            child: SingleChildScrollView(
              controller: ctrl,
              scrollDirection: Axis.horizontal,
              physics: user ? null : const NeverScrollableScrollPhysics(),
              child: child,
            ),
          );
      final footer = showTotals ? Row(children: [foot([0])!, side(_hFoot, foot(rest)!)]) : null;
      return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Row(children: [head([0]), side(_hHead, head(rest))]),
        vertical(showEmpty
            ? SingleChildScrollView(scrollDirection: Axis.horizontal, child: emptyRow)
            : Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Column(children: body([0])),
                side(_hBody, Column(crossAxisAlignment: CrossAxisAlignment.start, children: body(rest)), user: true),
              ])),
        ?footer,
      ]);
    }

    final caption = widget.captionHidden
        ? null
        : Padding(
            padding: const EdgeInsets.only(bottom: CmSpace.s8),
            child: Text(widget.caption, style: CmType.headingSm.copyWith(color: c.textDefault)),
          );

    final hint = ValueListenableBuilder<bool>(
      valueListenable: _moreEnd,
      builder: (context, more, _) => !more || widget.mobile == CmDataTableMobile.cards
          ? const SizedBox.shrink()
          : ExcludeSemantics(
              child: Padding(
                padding: const EdgeInsets.only(top: CmSpace.s8),
                child: Row(mainAxisAlignment: MainAxisAlignment.end, spacing: CmSpace.s4, children: [
                  Text(s.tableScrollHint, style: CmType.bodyXs.copyWith(color: c.textTertiary)),
                  CmIcon(rtl ? CmIcons.chevronLeft : CmIcons.chevronRight, size: 16, color: c.textTertiary),
                ]),
              ),
            ),
    );

    final layout = LayoutBuilder(builder: (context, box) {
      if (widget.mobile == CmDataTableMobile.cards && box.maxWidth <= 640 && !widget.loading && rows.isNotEmpty) {
        return _cards(context, rows, showTotals);
      }
      return Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: [table(box), hint]);
    });

    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: widget.loading ? s.captionLoading(widget.caption) : widget.caption,
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: [
        if (caption != null) ExcludeSemantics(child: caption),
        if (widget.columnPicker) Align(alignment: AlignmentDirectional.centerEnd, child: Padding(padding: const EdgeInsets.only(bottom: CmSpace.s8), child: _picker(context))),
        layout,
      ]),
    );
  }

  /// The "Columns" button and its list of checkboxes.
  Widget _picker(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final s = CmStrings.of(context);
    final primary = _primaryOf(_columns.where((col) => col.visible).toList());
    final rtl = Directionality.of(context) == TextDirection.rtl;
    void close() {
      _pickerPortal.hide();
      setState(() {});
      _pickerButton.requestFocus();
    }

    final h = cmIsTouch(context) ? CmControlHeight.touch : CmControlHeight.sm;
    return TapRegion(
      groupId: _pickerPortal,
      onTapOutside: (_) {
        if (_pickerPortal.isShowing) setState(_pickerPortal.hide);
      },
      child: CompositedTransformTarget(
        link: _pickerLink,
        child: OverlayPortal(
          controller: _pickerPortal,
          overlayChildBuilder: (context) => Positioned(
            child: CompositedTransformFollower(
              link: _pickerLink,
              showWhenUnlinked: false,
              targetAnchor: rtl ? Alignment.bottomLeft : Alignment.bottomRight,
              followerAnchor: rtl ? Alignment.topLeft : Alignment.topRight,
              offset: const Offset(0, CmSpace.s4),
              child: TapRegion(
                groupId: _pickerPortal,
                child: CallbackShortcuts(
                  bindings: {const SingleActivator(LogicalKeyboardKey.escape): close},
                  child: FocusScope(
                    autofocus: true,
                    child: Semantics(
                      container: true,
                      explicitChildNodes: true,
                      label: s.tableShowColumns,
                      child: Material(
                        color: c.bgSurface,
                        elevation: 0,
                        shape: RoundedRectangleBorder(side: BorderSide(color: c.borderSubtle), borderRadius: BorderRadius.circular(CmRadius.md)),
                        child: Container(
                          constraints: const BoxConstraints(minWidth: 200),
                          decoration: BoxDecoration(borderRadius: BorderRadius.circular(CmRadius.md), boxShadow: CmShadow.md),
                          padding: const EdgeInsets.all(CmSpace.s8),
                          child: StatefulBuilder(
                            builder: (context, setLocal) => Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                              for (final col in _columns)
                                ConstrainedBox(
                                  constraints: BoxConstraints(minHeight: h),
                                  child: Align(
                                    alignment: AlignmentDirectional.centerStart,
                                    child: Padding(
                                      padding: const EdgeInsets.symmetric(horizontal: CmSpace.s8),
                                      child: CmCheckbox(
                                        label: col.label,
                                        value: col.visible,
                                        onChanged: col == primary
                                            ? null
                                            : (v) {
                                                _setVisible(col.key, v ?? false);
                                                setLocal(() {});
                                              },
                                      ),
                                    ),
                                  ),
                                ),
                            ]),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          child: CmButton(
            label: s.tableColumns,
            size: CmButtonSize.slim,
            icon: null,
            semanticLabel: '${s.tableColumns}, ${_pickerPortal.isShowing ? s.expanded : s.collapsed}',
            onPressed: () => setState(_pickerPortal.isShowing ? _pickerPortal.hide : _pickerPortal.show),
          ),
        ),
      ),
    );
  }
}

extension on _CmDataTableState {
  /// The cards layout ([CmDataTableMobile.cards]): each row a card with the first column as its title, then the
  /// other columns as label and value pairs (numbers at the end), and the totals as a last card.
  Widget _cards(BuildContext context, List<Map<String, Object?>> rows, bool showTotals) {
    final c = CmTheme.colorsOf(context);
    final strings = CmStrings.of(context);
    final cols = _columns.where((col) => col.visible).toList();
    final primary = _primaryOf(cols)!;
    final fields = cols.where((col) => col != primary && !col.hidden && !col._isActions).toList();
    final actionCols = cols.where((col) => col._isActions).toList();
    String name(Map<String, Object?> r) => CmDataTable.format(r[primary.key], strings: strings);
    Widget card(Map<String, Object?> r, {bool total = false}) => Container(
          padding: const EdgeInsets.symmetric(horizontal: CmSpace.s16, vertical: CmSpace.s12),
          decoration: BoxDecoration(color: c.bgSurface, border: Border.all(color: c.borderSubtle), borderRadius: BorderRadius.circular(CmRadius.md)),
          child: Semantics(
            container: true,
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: [
              Semantics(
                header: true,
                child: Text(CmDataTable.format(r[primary.key], strings: strings),
                    style: CmType.bodyMd.copyWith(fontWeight: total ? FontWeight.w500 : FontWeight.w600, color: c.textDefault)),
              ),
              for (final col in fields) ...[
                const SizedBox(height: CmSpace.s4),
                MergeSemantics(
                  child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Expanded(flex: 2, child: Text(col.label, style: CmType.bodyXs.copyWith(color: c.textTertiary))),
                    const SizedBox(width: CmSpace.s12),
                    Expanded(
                      flex: 3,
                      child: Text(
                        CmDataTable.format(r[col.key], strings: strings),
                        textAlign: col._end ? TextAlign.end : TextAlign.start,
                        softWrap: col.type == CmDataColumnType.text,
                        maxLines: col.lines != null && col._lines > 1 ? col._lines : null,
                        overflow: col.lines != null && col._lines > 1 ? TextOverflow.ellipsis : null,
                        style: CmType.bodySm.copyWith(color: c.textDefault, fontFeatures: const [FontFeature.tabularFigures()]),
                      ),
                    ),
                  ]),
                ),
              ],
              if (!total)
                for (final col in actionCols)
                  if (_actionsOf(col, r).isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: CmSpace.s8),
                      child: Wrap(spacing: CmSpace.s8, runSpacing: CmSpace.s8, children: [
                        for (final a in _actionsOf(col, r))
                          a.iconOnly
                              ? CmButton.iconOnly(
                                  icon: a.icon!,
                                  label: strings.tableRowAction(a.label, name(r)),
                                  size: CmButtonSize.slim,
                                  tone: a.critical ? CmButtonTone.critical : null,
                                  onPressed: () => widget.onRowAction?.call(a.value ?? a.label, r, widget.rows.indexOf(r)),
                                )
                              : CmButton(
                                  label: a.label,
                                  icon: a.icon,
                                  semanticLabel: strings.tableRowAction(a.label, name(r)),
                                  size: CmButtonSize.slim,
                                  tone: a.critical ? CmButtonTone.critical : null,
                                  onPressed: () => widget.onRowAction?.call(a.value ?? a.label, r, widget.rows.indexOf(r)),
                                ),
                      ]),
                    ),
            ]),
          ),
        );
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, spacing: CmSpace.s8, children: [
      for (final r in rows) card(r),
      if (showTotals) card(widget.totals!, total: true),
    ]);
  }
}

class _SortHeading extends StatefulWidget {
  const _SortHeading({required this.label, required this.semanticLabel, required this.icon, required this.showIcon, required this.iconFirst, required this.focusRing, required this.onTap});
  final Widget label, icon;
  final String semanticLabel;
  final bool showIcon, iconFirst;
  final BoxDecoration focusRing;
  final VoidCallback onTap;

  @override
  State<_SortHeading> createState() => _SortHeadingState();
}

class _SortHeadingState extends State<_SortHeading> {
  bool _hover = false, _focus = false;

  @override
  Widget build(BuildContext context) {
    final icon = Opacity(opacity: widget.showIcon || _hover ? 1 : 0, child: widget.icon);
    return Semantics(
      button: true,
      header: true,
      label: widget.semanticLabel,
      excludeSemantics: true,
      onTap: widget.onTap,
      child: FocusableActionDetector(
        mouseCursor: SystemMouseCursors.click,
        onShowHoverHighlight: (v) => setState(() => _hover = v),
        onShowFocusHighlight: (v) => setState(() => _focus = v),
        actions: {ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) { widget.onTap(); return null; })},
        child: GestureDetector(
          onTap: widget.onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 2),
            decoration: _focus ? widget.focusRing : null,
            child: Row(mainAxisSize: MainAxisSize.min, children: widget.iconFirst
                ? [icon, const SizedBox(width: 4), Flexible(child: widget.label)]
                : [Flexible(child: widget.label), const SizedBox(width: 4), icon]),
          ),
        ),
      ),
    );
  }
}

/// A column's resize handle: a 12px strip at the heading's end edge. Drag it, or focus it and press ← and → (16px a
/// press). Read as "Resize Customer column" with its width as the value.
class _ResizeHandle extends StatefulWidget {
  const _ResizeHandle({required this.label, required this.width, required this.rtl, required this.onChange});
  final String label;
  final double width;
  final bool rtl;
  final void Function(double width, bool done) onChange;

  @override
  State<_ResizeHandle> createState() => _ResizeHandleState();
}

class _ResizeHandleState extends State<_ResizeHandle> {
  bool _hover = false, _focus = false, _drag = false;
  double _start = 0, _dx = 0;

  void _nudge(int dir) => widget.onChange(widget.width + dir * _step, true);

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final grow = widget.rtl ? LogicalKeyboardKey.arrowLeft : LogicalKeyboardKey.arrowRight;
    final shrink = widget.rtl ? LogicalKeyboardKey.arrowRight : LogicalKeyboardKey.arrowLeft;
    final w = widget.width.round();
    return Semantics(
      slider: true,
      label: widget.label,
      value: '$w',
      increasedValue: '${w + _step.round()}',
      decreasedValue: '${(w - _step).clamp(_minWidth, double.infinity).round()}',
      onIncrease: () => _nudge(1),
      onDecrease: () => _nudge(-1),
      child: FocusableActionDetector(
        mouseCursor: SystemMouseCursors.resizeColumn,
        onShowHoverHighlight: (v) => setState(() => _hover = v),
        onShowFocusHighlight: (v) => setState(() => _focus = v),
        shortcuts: {SingleActivator(grow): const _NudgeIntent(1), SingleActivator(shrink): const _NudgeIntent(-1)},
        actions: {_NudgeIntent: CallbackAction<_NudgeIntent>(onInvoke: (i) { _nudge(i.dir); return null; })},
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onHorizontalDragStart: (_) => setState(() {
            _drag = true;
            _start = widget.width;
            _dx = 0;
          }),
          onHorizontalDragUpdate: (d) {
            _dx += d.delta.dx * (widget.rtl ? -1 : 1);
            widget.onChange(_start + _dx, false);
          },
          onHorizontalDragEnd: (_) {
            setState(() => _drag = false);
            widget.onChange(_start + _dx, true);
          },
          child: SizedBox(
            width: CmSpace.s12,
            child: Center(child: Container(width: 2, color: _hover || _focus || _drag ? c.borderStrong : Colors.transparent)),
          ),
        ),
      ),
    );
  }
}

class _NudgeIntent extends Intent {
  const _NudgeIntent(this.dir);
  final int dir;
}

/// A small underlined text button (the priority layout's "View all fields").
class _TextButton extends StatefulWidget {
  const _TextButton({required this.label, required this.expanded, required this.onTap});
  final String label;
  final bool expanded;
  final VoidCallback onTap;

  @override
  State<_TextButton> createState() => _TextButtonState();
}

class _TextButtonState extends State<_TextButton> {
  bool _focus = false;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    return Semantics(
      button: true,
      expanded: widget.expanded,
      label: widget.label,
      excludeSemantics: true,
      onTap: widget.onTap,
      child: FocusableActionDetector(
        mouseCursor: SystemMouseCursors.click,
        onShowFocusHighlight: (v) => setState(() => _focus = v),
        actions: {ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) { widget.onTap(); return null; })},
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: widget.onTap,
          child: Container(
            height: CmSpace.s24,
            alignment: AlignmentDirectional.centerStart,
            decoration: _focus ? BoxDecoration(border: Border.all(color: c.borderStrong, width: 2), borderRadius: BorderRadius.circular(CmRadius.xs)) : null,
            child: Text(widget.label, style: CmType.bodyXs.copyWith(fontWeight: FontWeight.w500, color: c.textDefault, decoration: TextDecoration.underline)),
          ),
        ),
      ),
    );
  }
}
