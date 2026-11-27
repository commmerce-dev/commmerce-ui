// CmStatusTabs: each label is one Text widget, and a tab selected from outside scrolls into view.
import 'package:commmerce_ui/commmerce_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

Widget app(Widget child, {double width = 800}) => MaterialApp(
      theme: CmTheme.light(),
      home: Scaffold(body: Align(alignment: AlignmentDirectional.topStart, child: SizedBox(width: width, child: child))),
    );

void main() {
  testWidgets('each label is found once and tapping it selects the tab', (t) async {
    String? changed;
    await t.pumpWidget(app(CmStatusTabs(
      tabs: const [CmStatusTab('open', 'Open', count: 3), CmStatusTab('closed', 'Closed')],
      value: 'open',
      onChanged: (v) => changed = v,
    )));
    expect(find.text('Open'), findsOneWidget);
    expect(find.text('Closed'), findsOneWidget);
    await t.tap(find.text('Closed'));
    expect(changed, 'closed');
  });

  testWidgets('the selected label keeps the width of its semibold weight', (t) async {
    Future<double> widthOf(String value) async {
      await t.pumpWidget(app(CmStatusTabs(
        tabs: const [CmStatusTab('a', 'Assigned to me'), CmStatusTab('b', 'Backlog')],
        value: value,
        onChanged: (_) {},
      )));
      return t.getTopLeft(find.text('Backlog')).dx;
    }

    expect(await widthOf('a'), await widthOf('b'), reason: 'selecting a tab does not shift the ones after it');
  });

  group('a tab selected from outside scrolls into view', () {
    const names = ['one', 'two', 'three', 'four', 'five', 'six'];
    final tabs = [for (final n in names) CmStatusTab(n, 'Step $n')];
    const box = Rect.fromLTWH(0, 0, 390, 600);

    void expectVisible(WidgetTester t, String label) {
      final r = t.getRect(find.text(label));
      expect(r.left >= box.left - 0.5 && r.right <= box.left + 390 + 0.5, isTrue, reason: '$label at $r');
    }

    testWidgets('on first build', (t) async {
      await t.pumpWidget(app(CmStatusTabs(tabs: tabs, value: 'five', onChanged: (_) {}), width: 390));
      await t.pumpAndSettle();
      expectVisible(t, 'Step five');
    });

    testWidgets('when the parent changes the value', (t) async {
      late StateSetter set;
      String value = 'one';
      await t.pumpWidget(app(StatefulBuilder(builder: (c, s) {
        set = s;
        return CmStatusTabs(tabs: tabs, value: value, onChanged: (_) {});
      }), width: 390));
      await t.pumpAndSettle();
      expectVisible(t, 'Step one');
      set(() => value = 'six');
      await t.pumpAndSettle();
      expectVisible(t, 'Step six');
      expect(FocusManager.instance.primaryFocus?.debugLabel?.startsWith('CmStatusTabs') ?? false, isFalse, reason: 'focus does not move');
    });
  });
}
