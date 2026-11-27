import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

import 'generated/tokens.g.dart';
import 'app_frame.dart';
import 'theme.dart';

/// Lays out children in a column (default) or a row, a spacing token apart. Mirrors `<cm-stack>`.
class CmStack extends StatelessWidget {
  const CmStack({
    super.key,
    required this.children,
    this.direction = Axis.vertical,
    this.gap = CmSpace.s20,
    this.align,
    this.justify = MainAxisAlignment.start,
    this.wrap = false,
  });

  final List<Widget> children;

  /// [Axis.vertical] stacks top to bottom; [Axis.horizontal] lays items out in a row (right to left in RTL).
  final Axis direction;

  /// Space between items: use a [CmSpace] token. Default [CmSpace.s20], the gap between cards.
  final double gap;

  /// Cross-axis alignment. Default stretch in a column and centre in a row.
  final CrossAxisAlignment? align;

  /// Main-axis distribution. [MainAxisAlignment.spaceBetween] pushes the first and last items to the edges.
  final MainAxisAlignment justify;

  /// Lets a row wrap onto more lines when it runs out of space.
  final bool wrap;

  @override
  Widget build(BuildContext context) {
    final vertical = direction == Axis.vertical;
    final cross = align ?? (vertical ? CrossAxisAlignment.stretch : CrossAxisAlignment.center);
    if (wrap && !vertical) {
      return Wrap(
        spacing: gap,
        runSpacing: gap,
        alignment: switch (justify) {
          MainAxisAlignment.center => WrapAlignment.center,
          MainAxisAlignment.end => WrapAlignment.end,
          MainAxisAlignment.spaceBetween => WrapAlignment.spaceBetween,
          MainAxisAlignment.spaceAround => WrapAlignment.spaceAround,
          MainAxisAlignment.spaceEvenly => WrapAlignment.spaceEvenly,
          _ => WrapAlignment.start,
        },
        crossAxisAlignment: switch (cross) {
          CrossAxisAlignment.center => WrapCrossAlignment.center,
          CrossAxisAlignment.end => WrapCrossAlignment.end,
          _ => WrapCrossAlignment.start,
        },
        children: children,
      );
    }
    return Flex(
      direction: direction,
      spacing: gap,
      mainAxisSize: vertical ? MainAxisSize.min : MainAxisSize.max,
      mainAxisAlignment: justify,
      crossAxisAlignment: cross,
      textBaseline: cross == CrossAxisAlignment.baseline ? TextBaseline.alphabetic : null,
      children: children,
    );
  }
}

/// Equal-width columns, for tiles, cards and short fields side by side. Mirrors `<cm-grid>`.
///
/// Collapses to one column when the grid itself is 640px wide or less, so it also works inside a
/// narrow side column. With [minColumnWidth] it fits as many columns as there is room for instead.
class CmGrid extends StatelessWidget {
  const CmGrid({super.key, required this.children, this.columns = 2, this.minColumnWidth, this.gap = CmSpace.s20});

  /// The grid items, in reading order.
  final List<Widget> children;

  /// Number of columns. Default 2. Ignored when [minColumnWidth] is set.
  final int columns;

  /// Fit as many columns as there is room for, each at least this wide (never wider than the grid).
  /// With fewer items than that, the items share the row (like CSS `auto-fit`): no empty columns.
  final double? minColumnWidth;

  /// Space between items, across and down: use a [CmSpace] token.
  final double gap;

  /// How many columns fit in a grid [width] pixels wide. With [minColumnWidth], a grid with fewer
  /// children than this shows one column per child.
  static int columnsFor(double width, {int columns = 2, double? minColumnWidth, double gap = CmSpace.s20}) {
    if (!width.isFinite) return 1;
    if (minColumnWidth != null) {
      final min = minColumnWidth < width ? minColumnWidth : width;
      if (min <= 0) return 1;
      final n = ((width + gap) / (min + gap)).floor();
      return n < 1 ? 1 : n;
    }
    if (width <= 640) return 1;
    return columns < 1 ? 1 : columns;
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, box) {
      var n = columnsFor(box.maxWidth, columns: columns, minColumnWidth: minColumnWidth, gap: gap);
      // Like CSS auto-fit, a fitted grid drops the columns no item fills, so fewer items share the row.
      if (minColumnWidth != null && children.isNotEmpty) n = math.min(n, children.length);
      if (n == 1) return Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, spacing: gap, children: children);
      return Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, spacing: gap, children: [
        for (var start = 0; start < children.length; start += n)
          Row(crossAxisAlignment: CrossAxisAlignment.start, spacing: gap, children: [
            for (var i = start; i < start + n; i++) Expanded(child: i < children.length ? children[i] : const SizedBox.shrink()),
          ]),
      ]);
    });
  }
}

/// Width of a [CmLayoutSection] on wide layouts.
enum CmLayoutVariant {
  full(6),
  oneHalf(3),
  oneThird(2),
  twoThirds(4);

  const CmLayoutVariant(this.span);

  /// Columns out of six.
  final int span;
}

/// The body of an admin page: sections side by side, for example the main and side columns of a detail
/// page. Mirrors `<cm-layout>`.
///
/// Sections stack into one column, in source order, when the layout itself is narrower than 768px
/// (measured with a [LayoutBuilder], so it follows the space the layout gets, not the window).
/// Put the main section first.
class CmLayout extends StatelessWidget {
  const CmLayout({super.key, required this.children, this.gap = CmSpace.s24});

  /// [CmLayoutSection]s, in reading order.
  final List<CmLayoutSection> children;

  /// Space between sections, across and down: use a [CmSpace] token.
  final double gap;

  /// Layouts narrower than this stack their sections.
  static const double stackBelow = 768;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, box) {
      final w = box.maxWidth;
      if (!w.isFinite || w < stackBelow) {
        return Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, spacing: gap, children: children);
      }
      // A six-column grid: sections fill rows in order and start a new row when they don't fit.
      final col = (w - 5 * gap) / 6;
      final rows = <List<CmLayoutSection>>[];
      var used = 6;
      for (final s in children) {
        if (used + s.variant.span > 6) {
          rows.add([]);
          used = 0;
        }
        rows.last.add(s);
        used += s.variant.span;
      }
      return Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, spacing: gap, children: [
        for (final row in rows)
          Row(crossAxisAlignment: CrossAxisAlignment.start, spacing: gap, children: [
            for (var i = 0; i < row.length; i++)
              // A full row's last section takes the rest, so rounding never overflows.
              if (i == row.length - 1 && row.fold<int>(0, (a, s) => a + s.variant.span) == 6)
                Expanded(child: row[i])
              else
                SizedBox(width: row[i].variant.span * col + (row[i].variant.span - 1) * gap, child: row[i]),
          ]),
      ]);
    });
  }
}

/// One column of a [CmLayout]. Its children are stacked [CmSpace.s20] apart (cards on the page).
/// Mirrors `<cm-layout-section>`.
class CmLayoutSection extends StatelessWidget {
  const CmLayoutSection({super.key, this.variant = CmLayoutVariant.full, required this.children});

  /// Width on wide layouts. A detail page is a [CmLayoutVariant.twoThirds] main section and a
  /// [CmLayoutVariant.oneThird] side section. Every section is full width once the layout stacks.
  final CmLayoutVariant variant;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) =>
      Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, spacing: CmSpace.s24, children: children);
}

/// How wide a [CmPage]'s content gets (owner standard, 1.6). Pick it by what the page holds.
enum CmPageWidth {
  /// 640: settings and single-column forms.
  form,

  /// 1040: one record (an order, a customer).
  detail,

  /// 1600: lists and dashboards. The default.
  wide,

  /// Every pixel of width: wide tables and reports.
  full,
}

/// A whole admin page: the page header across the top, then the content on the page background with page
/// padding ([CmSpace.s24], or [CmSpace.s16] when the page is 640px wide or less; the same side padding as
/// [CmPageHeader], so titles and content line up), centred at [width]. Mirrors `<cm-page>`.
///
/// Inside a [CmAppFrame] with `panel` the page background is transparent, so the page sits on the white panel.
///
/// ```dart
/// CmPage(header: const CmPageHeader(title: 'Orders'), width: CmPageWidth.detail, child: CmLayout(children: [...]))
/// ```
class CmPage extends StatelessWidget {
  const CmPage({super.key, this.header, required this.child, this.footer, this.fullWidth = false, this.narrow = false, this.scrollable = true, this.width = CmPageWidth.wide});

  /// A [CmPageHeader]. Runs edge to edge.
  final Widget? header;

  /// The page content, usually a [CmLayout].
  final Widget child;

  /// A [CmSaveBar] or [CmActionBar], after the content. With [scrollable] it stays at the bottom.
  final Widget? footer;

  /// Same as `width: CmPageWidth.full`: the content uses every pixel of width (wide tables, reports).
  final bool fullWidth;

  /// Content at most 800px wide, centred. Kept from 1.0; prefer [CmPageWidth.form] (640) or [CmPageWidth.detail] (1040).
  final bool narrow;

  /// The content's maximum width: form 640, detail 1040, wide 1600 (the default), full. Since 1.6.
  final CmPageWidth width;

  /// Scrolls the content between the header and footer. Turn it off when the page sits inside your own
  /// scroll view.
  final bool scrollable;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    return ColoredBox(
      color: CmAppFrame.isPanel(context) ? Colors.transparent : c.bgPage,
      child: LayoutBuilder(builder: (context, box) {
        final pad = box.maxWidth <= 640 ? CmSpace.s16 : CmSpace.s24;
        final max = fullWidth || width == CmPageWidth.full
            ? double.infinity
            : narrow
                ? 800.0
                : switch (width) { CmPageWidth.form => 640.0, CmPageWidth.detail => 1040.0, _ => 1600.0 };
        final content = Padding(
          padding: EdgeInsets.all(pad),
          child: Center(
            heightFactor: 1,
            child: ConstrainedBox(constraints: BoxConstraints(maxWidth: max), child: SizedBox(width: double.infinity, child: child)),
          ),
        );
        if (scrollable && box.maxHeight.isFinite) {
          return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            ?header,
            Expanded(child: SingleChildScrollView(child: content)),
            ?footer,
          ]);
        }
        return Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: [?header, content, ?footer]);
      }),
    );
  }
}

/// Where a [CmRecordLayout]'s aside goes once the columns stack.
enum CmAsidePosition {
  /// Above the main content: the key facts come first. The default.
  above,

  /// Below the main content.
  below,
}

/// The standard record page body (web 1.7, `<cm-layout variant="record">`): a lead, contact, deal, account or ticket,
/// an order or a product. A [main] column and an [aside] of key facts.
///
/// From [columnsFrom] (880) logical pixels of the layout's own width (measured with a [LayoutBuilder], so it follows
/// the space the layout gets, not the window) the aside is a [asideWidth] (320) column on the end side (on the left in
/// right-to-left layouts) and the main column takes the rest, [gap] apart. Narrower, they stack: the aside goes above
/// the main content (the key facts first) or below it with [asidePosition] [CmAsidePosition.below], and the default
/// gap of 24 becomes 16 once the layout is 640 wide or less. Cards in each column are as far apart as the columns.
///
/// [stickyAside] keeps the aside in view, [stickyTop] below the top of the scroll view, while the main column scrolls,
/// as long as the whole aside fits in the scroll view (a taller aside scrolls with the page, so nothing in it is out
/// of reach). Only while the columns are side by side, and only inside a vertical scroll view (a [CmPage] has one).
///
/// ```dart
/// CmPage(
///   header: CmPageHeader(title: 'Asha Rao', backLabel: 'Leads', onBack: () => Navigator.pop(context)),
///   child: CmRecordLayout(stickyAside: true, aside: [detailsPanel, ownerCard], main: [activityCard, dealsCard]),
/// )
/// ```
class CmRecordLayout extends StatelessWidget {
  const CmRecordLayout({
    super.key,
    required this.main,
    required this.aside,
    this.asidePosition = CmAsidePosition.above,
    this.stickyAside = false,
    this.stickyTop = CmSpace.s24,
    this.gap = CmSpace.s24,
  });

  /// The main column's content, usually cards: tabs over a timeline, then related lists.
  final List<Widget> main;

  /// The aside's content: a compact [CmInfoPanel] with [CmInfoLayout.rows], then short compact cards.
  final List<Widget> aside;

  /// Where the aside goes when the columns stack. Default [CmAsidePosition.above].
  final CmAsidePosition asidePosition;

  /// Keeps the aside in view while the main column scrolls, when it fits; see the class description.
  final bool stickyAside;

  /// With [stickyAside]: how far from the top of the scroll view the aside stops. Default 24.
  final double stickyTop;

  /// Space between the columns and between the cards in them: use a [CmSpace] token. The default 24 becomes 16 when
  /// the layout is 640 wide or less.
  final double gap;

  /// The aside's width when the columns are side by side.
  static const double asideWidth = 320;

  /// Layouts at least this wide put the columns side by side.
  static const double columnsFrom = 880;

  /// Whether a record layout [width] logical pixels wide puts its columns side by side.
  static bool sideBySide(double width) => width.isFinite && width >= columnsFrom;

  /// The gap a record layout [width] wide uses for [gap].
  static double gapFor(double width, [double gap = CmSpace.s24]) => gap == CmSpace.s24 && width <= 640 ? CmSpace.s16 : gap;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, box) {
      final g = gapFor(box.maxWidth, gap);
      Widget column(List<Widget> children) =>
          Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, spacing: g, children: children);
      final mainColumn = column(main);
      final asideColumn = column(aside);
      if (!sideBySide(box.maxWidth)) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          spacing: g,
          children: asidePosition == CmAsidePosition.above ? [asideColumn, mainColumn] : [mainColumn, asideColumn],
        );
      }
      final scrollable = Scrollable.maybeOf(context);
      final position = stickyAside && scrollable != null && axisDirectionToAxis(scrollable.axisDirection) == Axis.vertical ? scrollable.position : null;
      return _RecordColumns(gap: g, position: position, stickyTop: stickyTop, main: mainColumn, aside: asideColumn);
    });
  }
}

/// Main and aside side by side; the aside optionally sticks (like CSS `position: sticky`).
class _RecordColumns extends MultiChildRenderObjectWidget {
  _RecordColumns({required this.gap, required this.position, required this.stickyTop, required Widget main, required Widget aside})
      : super(children: [main, aside]);

  final double gap, stickyTop;
  final ScrollPosition? position;

  @override
  RenderObject createRenderObject(BuildContext context) => _RenderRecordColumns(gap, stickyTop, position, Directionality.of(context));

  @override
  void updateRenderObject(BuildContext context, RenderObject renderObject) {
    (renderObject as _RenderRecordColumns)
      ..gap = gap
      ..stickyTop = stickyTop
      ..position = position
      ..textDirection = Directionality.of(context);
  }
}

class _RecordParentData extends ContainerBoxParentData<RenderBox> {}

class _RenderRecordColumns extends RenderBox
    with ContainerRenderObjectMixin<RenderBox, _RecordParentData>, RenderBoxContainerDefaultsMixin<RenderBox, _RecordParentData> {
  _RenderRecordColumns(this._gap, this._stickyTop, this._position, this._textDirection);

  double _gap, _stickyTop;
  ScrollPosition? _position;
  TextDirection _textDirection;

  set gap(double v) { if (v != _gap) { _gap = v; markNeedsLayout(); } }
  set stickyTop(double v) { if (v != _stickyTop) { _stickyTop = v; markNeedsPaint(); } }
  set textDirection(TextDirection v) { if (v != _textDirection) { _textDirection = v; markNeedsLayout(); } }
  set position(ScrollPosition? v) {
    if (v == _position) return;
    if (attached) _position?.removeListener(_onScroll);
    _position = v;
    if (attached) _position?.addListener(_onScroll);
    markNeedsPaint();
  }

  // The aside's place depends on the scroll offset: repaint it there, and move its semantics (and hit area) with it.
  void _onScroll() {
    markNeedsPaint();
    markNeedsSemanticsUpdate();
  }

  @override
  void attach(PipelineOwner owner) {
    super.attach(owner);
    _position?.addListener(_onScroll);
  }

  @override
  void detach() {
    _position?.removeListener(_onScroll);
    super.detach();
  }

  @override
  void setupParentData(RenderBox child) {
    if (child.parentData is! _RecordParentData) child.parentData = _RecordParentData();
  }

  RenderBox get _main => firstChild!;
  RenderBox get _aside => lastChild!;

  double get _mainWidth => math.max(0, size.width - CmRecordLayout.asideWidth - _gap);

  @override
  double computeMinIntrinsicWidth(double height) => CmRecordLayout.columnsFrom;

  @override
  double computeMaxIntrinsicWidth(double height) =>
      math.max(CmRecordLayout.columnsFrom, _main.getMaxIntrinsicWidth(height) + _gap + CmRecordLayout.asideWidth);

  @override
  double computeMinIntrinsicHeight(double width) {
    final m = math.max(0.0, width - CmRecordLayout.asideWidth - _gap);
    return math.max(_main.getMinIntrinsicHeight(m), _aside.getMinIntrinsicHeight(CmRecordLayout.asideWidth));
  }

  @override
  double computeMaxIntrinsicHeight(double width) {
    final m = math.max(0.0, width - CmRecordLayout.asideWidth - _gap);
    return math.max(_main.getMaxIntrinsicHeight(m), _aside.getMaxIntrinsicHeight(CmRecordLayout.asideWidth));
  }

  @override
  Size computeDryLayout(BoxConstraints constraints) {
    final w = constraints.maxWidth;
    final m = math.max(0.0, w - CmRecordLayout.asideWidth - _gap);
    final h = math.max(
      _main.getDryLayout(BoxConstraints.tightFor(width: m)).height,
      _aside.getDryLayout(const BoxConstraints.tightFor(width: CmRecordLayout.asideWidth)).height,
    );
    return constraints.constrain(Size(w, h));
  }

  @override
  void performLayout() {
    final w = constraints.maxWidth;
    final m = math.max(0.0, w - CmRecordLayout.asideWidth - _gap);
    _main.layout(BoxConstraints.tightFor(width: m), parentUsesSize: true);
    _aside.layout(const BoxConstraints.tightFor(width: CmRecordLayout.asideWidth), parentUsesSize: true);
    size = constraints.constrain(Size(w, math.max(_main.size.height, _aside.size.height)));
    final rtl = _textDirection == TextDirection.rtl;
    (_main.parentData! as _RecordParentData).offset = Offset(rtl ? CmRecordLayout.asideWidth + _gap : 0, 0);
    (_aside.parentData! as _RecordParentData).offset = Offset(rtl ? 0 : _mainWidth + _gap, 0);
  }

  RenderBox? get _viewport {
    final v = RenderAbstractViewport.maybeOf(this);
    return v is RenderBox ? v as RenderBox : null;
  }

  /// Whether the aside currently sticks: sticky is on, the columns are in a vertical scroll view and the whole
  /// aside (plus [stickyTop]) fits in it.
  bool get asideSticks {
    if (_position == null || !hasSize) return false;
    final viewport = _viewport;
    if (viewport == null || !viewport.hasSize) return false;
    return _aside.size.height + _stickyTop <= viewport.size.height;
  }

  /// How far the aside is pushed down from its place at the top of the row to stay in view.
  double get _stickyShift {
    if (!asideSticks) return 0;
    final top = getTransformTo(_viewport).getTranslation().y;
    final room = size.height - _aside.size.height;
    if (room <= 0) return 0;
    return (_stickyTop - top).clamp(0.0, room);
  }

  Offset _offsetOf(RenderBox child) {
    final o = (child.parentData! as _RecordParentData).offset;
    return identical(child, _aside) ? o.translate(0, _stickyShift) : o;
  }

  @override
  void applyPaintTransform(RenderBox child, Matrix4 transform) {
    final o = _offsetOf(child);
    transform.translate(o.dx, o.dy);
  }

  @override
  void paint(PaintingContext context, Offset offset) {
    context.paintChild(_main, offset + _offsetOf(_main));
    context.paintChild(_aside, offset + _offsetOf(_aside));
  }

  @override
  bool hitTestChildren(BoxHitTestResult result, {required Offset position}) {
    for (final child in [_aside, _main]) {
      final hit = result.addWithPaintOffset(
        offset: _offsetOf(child),
        position: position,
        hitTest: (result, transformed) => child.hitTest(result, position: transformed),
      );
      if (hit) return true;
    }
    return false;
  }
}
