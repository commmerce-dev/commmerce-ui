import 'package:commmerce_ui/commmerce_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

/// Puts [child] in a box [width] wide, in a window wide enough for it.
Future<void> pumpAt(WidgetTester t, double width, Widget child, {double windowWidth = 1600}) async {
  t.view.physicalSize = Size(windowWidth, 1200);
  t.view.devicePixelRatio = 1;
  addTearDown(t.view.reset);
  await t.pumpWidget(MaterialApp(
    theme: CmTheme.light(),
    home: Scaffold(body: SingleChildScrollView(child: Align(alignment: Alignment.topLeft, child: SizedBox(width: width, child: child)))),
  ));
}

Widget box(String id, [double h = 50]) => SizedBox(key: ValueKey(id), height: h, child: Text(id));

Rect rectOf(WidgetTester t, String id) => t.getRect(find.byKey(ValueKey(id)));

void main() {
  group('layout', () {
    final detail = CmLayout(children: [
      CmLayoutSection(variant: CmLayoutVariant.twoThirds, children: [box('main'), box('main 2')]),
      CmLayoutSection(variant: CmLayoutVariant.oneThird, children: [box('side')]),
      CmLayoutSection(variant: CmLayoutVariant.oneHalf, children: [box('half a')]),
      CmLayoutSection(variant: CmLayoutVariant.oneHalf, children: [box('half b')]),
      CmLayoutSection(children: [box('full')]),
    ]);

    testWidgets('at 1000px: two-thirds 658.7, one-third 317.3, halves 488, full 1000 (six columns, 24px gaps; 1.6)', (t) async {
      await pumpAt(t, 1000, detail);
      // Six columns of (1000 - 5 x 24) / 6 = 146.67.
      expect(rectOf(t, 'main').width, closeTo(658.67, 0.01));
      expect(rectOf(t, 'side').width, closeTo(317.33, 0.01));
      expect(rectOf(t, 'side').left, closeTo(682.67, 0.01));
      expect(rectOf(t, 'side').top, rectOf(t, 'main').top, reason: 'side by side');
      expect(rectOf(t, 'main 2').top - rectOf(t, 'main').bottom, 24, reason: 'cards in a section are 24 apart');
      expect(rectOf(t, 'half a').width, closeTo(488, 0.01));
      expect(rectOf(t, 'half b').left, closeTo(512, 0.01));
      expect(rectOf(t, 'half a').top, rectOf(t, 'main 2').bottom + 24, reason: 'next row starts under the tallest section');
      expect(rectOf(t, 'full').width, 1000);
    });

    testWidgets('at 600px every section is full width, stacked in source order', (t) async {
      await pumpAt(t, 600, detail);
      final order = ['main', 'main 2', 'side', 'half a', 'half b', 'full'];
      for (final id in order) {
        expect(rectOf(t, id).width, 600, reason: id);
        expect(rectOf(t, id).left, 0, reason: id);
      }
      for (var i = 1; i < order.length; i++) {
        expect(rectOf(t, order[i]).top, greaterThan(rectOf(t, order[i - 1]).top), reason: '${order[i]} below ${order[i - 1]}');
      }
    });

    testWidgets('follows its own width, not the window: stacks in a 700px column of a 1600px window', (t) async {
      await pumpAt(t, 700, detail, windowWidth: 1600);
      expect(rectOf(t, 'side').width, 700);
      await pumpAt(t, 768, detail, windowWidth: 800);
      expect(rectOf(t, 'side').width, lessThan(768), reason: '768 and wider: side by side');
    });
  });

  group('grid', () {
    final items = [for (var i = 1; i <= 5; i++) box('tile $i', i * 10.0 + 40)];

    testWidgets('equal columns, top-aligned; one column at 640px or less', (t) async {
      await pumpAt(t, 1000, CmGrid(columns: 3, children: items));
      expect(rectOf(t, 'tile 1').width, closeTo(320, 0.01));
      expect(rectOf(t, 'tile 2').left, closeTo(340, 0.01));
      expect(rectOf(t, 'tile 3').top, rectOf(t, 'tile 1').top);
      expect(rectOf(t, 'tile 4').left, 0);
      expect(rectOf(t, 'tile 4').top, rectOf(t, 'tile 3').bottom + 20, reason: 'the row is as tall as its tallest tile');

      await pumpAt(t, 640, CmGrid(columns: 3, children: items));
      for (final id in ['tile 1', 'tile 3', 'tile 5']) {
        expect(rectOf(t, id).width, 640);
      }
      await pumpAt(t, 641, CmGrid(columns: 3, children: items));
      expect(rectOf(t, 'tile 1').width, lessThan(641));
    });

    testWidgets('auto-fit: as many columns as fit at the minimum width', (t) async {
      await pumpAt(t, 1000, CmGrid(minColumnWidth: 240, gap: CmSpace.s8, children: items));
      // (1000 + 8) / (240 + 8) = 4 columns of 244.
      expect(rectOf(t, 'tile 1').width, closeTo(244, 0.01));
      expect(rectOf(t, 'tile 5').left, 0);
      await pumpAt(t, 200, CmGrid(minColumnWidth: 240, children: items));
      expect(rectOf(t, 'tile 1').width, 200, reason: 'never wider than the grid');
      expect(CmGrid.columnsFor(500, minColumnWidth: 240), 2);
      expect(CmGrid.columnsFor(500, columns: 4), 1, reason: 'fixed columns collapse below 641');
    });
  });

  group('stack', () {
    testWidgets('column 20 apart by default, stretched', (t) async {
      await pumpAt(t, 400, CmStack(children: [box('a'), box('b')]));
      expect(rectOf(t, 'b').top - rectOf(t, 'a').bottom, 20);
      expect(rectOf(t, 'a').width, 400);
    });

    testWidgets('row with a gap token, space-between, and wrapping', (t) async {
      Widget chip(String id) => SizedBox(key: ValueKey(id), width: 150, height: 30);
      await pumpAt(t, 400, CmStack(direction: Axis.horizontal, gap: CmSpace.s8, justify: MainAxisAlignment.spaceBetween, children: [chip('a'), chip('b')]));
      expect(rectOf(t, 'a').left, 0);
      expect(rectOf(t, 'b').right, 400);
      await pumpAt(t, 400, CmStack(direction: Axis.horizontal, gap: CmSpace.s8, wrap: true, children: [chip('a'), chip('b'), chip('c')]));
      expect(rectOf(t, 'b').left, 158);
      expect(rectOf(t, 'c').left, 0);
      expect(rectOf(t, 'c').top, rectOf(t, 'a').bottom + 8);
    });
  });

  group('page', () {
    Future<void> pumpPage(WidgetTester t, Size size, CmPage page) async {
      t.view.physicalSize = size;
      t.view.devicePixelRatio = 1;
      addTearDown(t.view.reset);
      await t.pumpWidget(MaterialApp(theme: CmTheme.light(), home: Scaffold(body: page)));
    }

    testWidgets('header edge to edge, content on the page background with 24px padding, at most 1600 wide', (t) async {
      await pumpPage(t, const Size(2000, 900), CmPage(header: const CmPageHeader(title: 'Orders'), child: box('content')));
      expect(t.getRect(find.byType(CmPageHeader)).width, 2000);
      final r = rectOf(t, 'content');
      expect(r.width, 1600);
      expect(r.left, 200, reason: 'centred');
      expect(r.top, t.getRect(find.byType(CmPageHeader)).bottom + 24);
      final bg = t.widget<ColoredBox>(find.descendant(of: find.byType(CmPage), matching: find.byType(ColoredBox)).first);
      expect(bg.color, CmColors.light.bgPage);
    });

    testWidgets('16px padding at 640px or less; narrow is 800; full width uses everything', (t) async {
      await pumpPage(t, const Size(600, 900), CmPage(child: box('content')));
      expect(rectOf(t, 'content').left, 16);
      expect(rectOf(t, 'content').width, 568);
      await pumpPage(t, const Size(1200, 900), CmPage(narrow: true, child: box('content')));
      expect(rectOf(t, 'content').width, 800);
      await pumpPage(t, const Size(2000, 900), CmPage(fullWidth: true, child: box('content')));
      expect(rectOf(t, 'content').width, 1952);
    });

    testWidgets('width presets (1.6): form 640, detail 1040, wide 1600, full', (t) async {
      for (final (w, expected) in [(CmPageWidth.form, 640.0), (CmPageWidth.detail, 1040.0), (CmPageWidth.wide, 1600.0), (CmPageWidth.full, 2152.0)]) {
        await pumpPage(t, const Size(2200, 900), CmPage(width: w, child: box('content')));
        expect(rectOf(t, 'content').width, expected, reason: '$w');
        expect(rectOf(t, 'content').center.dx, 1100, reason: '$w is centred');
      }
    });

    testWidgets('inside a panel frame the page is transparent; the panel is white, rounded, 20 from the edges', (t) async {
      await pumpPage(t, const Size(1400, 900), CmPage(child: box('content')));
      final page = t.widget<ColoredBox>(find.descendant(of: find.byType(CmPage), matching: find.byType(ColoredBox)).first);
      expect(page.color, CmColors.light.bgPage);
      await t.pumpWidget(MaterialApp(
        theme: CmTheme.light(),
        home: CmAppFrame(
          panel: true,
          header: const SizedBox(height: 56),
          navigation: const SizedBox(key: ValueKey('nav'), width: 220, height: 400),
          body: CmPage(child: box('content')),
        ),
      ));
      final bg = t.widget<ColoredBox>(find.descendant(of: find.byType(CmPage), matching: find.byType(ColoredBox)).first);
      expect(bg.color, Colors.transparent);
      final panel = t.getRect(find.ancestor(of: find.byType(CmPage), matching: find.byType(DecoratedBox)).first);
      expect(panel.left, rectOf(t, 'nav').right + 20, reason: '20px gutter beside the navigation');
      expect(panel.right, 1380);
      expect(panel.bottom, 880);
    });

    testWidgets('content scrolls between header and a footer that stays at the bottom', (t) async {
      await pumpPage(t, const Size(1000, 600), CmPage(
        header: const CmPageHeader(title: 'Product'),
        footer: SizedBox(key: const ValueKey('footer'), height: 60, child: CmButton(label: 'Save', onPressed: () {})),
        child: box('content', 2000),
      ));
      expect(rectOf(t, 'footer').bottom, 600);
      final scroll = find.descendant(of: find.byType(CmPage), matching: find.byType(Scrollable));
      await t.drag(scroll, const Offset(0, -500));
      await t.pump();
      expect(rectOf(t, 'footer').bottom, 600);
      expect(rectOf(t, 'content').top, lessThan(0));
      expect(t.getRect(find.byType(CmPageHeader)).top, 0);
    });
  });
}
