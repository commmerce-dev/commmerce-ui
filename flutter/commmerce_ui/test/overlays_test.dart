import 'package:commmerce_ui/commmerce_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

/// A page with one button that runs [onOpen] with a context under the app's Navigator.
Widget app(void Function(BuildContext context) onOpen, {String label = 'Open', Widget? extra}) => MaterialApp(
      theme: CmTheme.light(),
      home: Scaffold(
        body: Builder(
          builder: (context) => Center(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              CmButton(label: label, onPressed: () => onOpen(context)),
              if (extra != null) extra,
            ]),
          ),
        ),
      ),
    );

void size(WidgetTester t, Size s) {
  t.view.physicalSize = s;
  t.view.devicePixelRatio = 1;
  addTearDown(t.view.reset);
}

/// Whether the [CmButton] labelled [label] has keyboard focus.
bool buttonFocused(WidgetTester t, String label) {
  final el = t.element(find.descendant(of: find.widgetWithText(CmButton, label), matching: find.byType(GestureDetector)).first);
  return Focus.of(el).hasPrimaryFocus;
}

/// Tabs to the opener and presses Enter, so it has focus as it would for a keyboard user.
Future<void> openWithKeyboard(WidgetTester t, String label) async {
  await t.sendKeyEvent(LogicalKeyboardKey.tab);
  await t.pump();
  expect(buttonFocused(t, label), isTrue, reason: 'the opener is the first focusable widget');
  await t.sendKeyEvent(LogicalKeyboardKey.enter);
  await t.pumpAndSettle();
}

SemanticsData semanticsOf(WidgetTester t, String label) => t.getSemantics(find.bySemanticsLabel(label)).getSemanticsData();

/// Every label in the live semantics tree (nodes hidden behind a modal barrier are left out of it).
List<String> treeLabels(WidgetTester t) {
  final out = <String>[];
  bool visit(SemanticsNode n) {
    out.add(n.label);
    n.visitChildren(visit);
    return true;
  }

  visit(t.binding.renderViews.first.owner!.semanticsOwner!.rootSemanticsNode!);
  return out;
}

/// The semantics of the dialog named [label] (its visible heading has the same label).
SemanticsData dialogNamed(WidgetTester t, String label) {
  for (final e in find.bySemanticsLabel(label).evaluate()) {
    final d = t.getSemantics(find.byElementPredicate((x) => x == e)).getSemanticsData();
    if (d.role == SemanticsRole.dialog) return d;
  }
  fail('no dialog named $label');
}

void main() {
  group('modal', () {
    testWidgets('opens, returns the action result, and dims the page with the overlay token', (t) async {
      size(t, const Size(1280, 900));
      Future<bool?>? result;
      await t.pumpWidget(app((context) {
        result = showCmModal<bool>(
          context: context,
          title: 'Cancel order #1042?',
          size: CmOverlaySize.small,
          builder: (_) => const Text('The customer gets a full refund.'),
          actions: (ctx) => [
            CmButton(label: 'Keep order', onPressed: () => Navigator.pop(ctx, false)),
            CmButton(label: 'Cancel order', variant: CmButtonVariant.primary, onPressed: () => Navigator.pop(ctx, true)),
          ],
        );
      }));
      await t.tap(find.text('Open'));
      await t.pumpAndSettle();
      expect(find.text('Cancel order #1042?'), findsOneWidget);
      expect(t.getSize(find.byType(CmModal).first).width, 1280, reason: 'the route fills the screen');
      // 400px wide for small.
      final panel = find.ancestor(of: find.text('Cancel order #1042?'), matching: find.byType(Material)).first;
      expect(t.getSize(panel).width, 400);
      final barrier = t.widgetList<ModalBarrier>(find.byType(ModalBarrier)).last;
      expect(barrier.color, CmColors.light.overlay);
      await t.tap(find.text('Cancel order'));
      await t.pumpAndSettle();
      expect(find.byType(CmModal), findsNothing);
      expect(await result, isTrue);
    });

    testWidgets('Esc closes it, focus returns to the opener, and the result is null', (t) async {
      Future<bool?>? result;
      await t.pumpWidget(app((context) => result = showCmModal<bool>(context: context, title: 'Change tracking info', builder: (_) => const Text('Body'))));
      await openWithKeyboard(t, 'Open');
      expect(find.byType(CmModal), findsOneWidget);
      expect(buttonFocused(t, 'Open'), isFalse, reason: 'focus moved into the modal');
      await t.sendKeyEvent(LogicalKeyboardKey.escape);
      await t.pumpAndSettle();
      expect(find.byType(CmModal), findsNothing);
      expect(await result, isNull);
      expect(buttonFocused(t, 'Open'), isTrue);
    });

    testWidgets('the close button and the dim close it', (t) async {
      await t.pumpWidget(app((context) => showCmModal<void>(context: context, title: 'Details', builder: (_) => const Text('Body'))));
      await t.tap(find.text('Open'));
      await t.pumpAndSettle();
      await t.tap(find.bySemanticsLabel('Close'));
      await t.pumpAndSettle();
      expect(find.byType(CmModal), findsNothing);
      await t.tap(find.text('Open'));
      await t.pumpAndSettle();
      await t.tapAt(const Offset(5, 5));
      await t.pumpAndSettle();
      expect(find.byType(CmModal), findsNothing);
    });

    testWidgets('a modal that is not dismissible ignores Esc and the dim and has no close button', (t) async {
      await t.pumpWidget(app((context) => showCmModal<void>(
            context: context,
            title: 'Accept the new terms',
            dismissible: false,
            builder: (_) => const Text('Body'),
            actions: (ctx) => [CmButton(label: 'Accept', onPressed: () => Navigator.pop(ctx))],
          )));
      await t.tap(find.text('Open'));
      await t.pumpAndSettle();
      expect(find.bySemanticsLabel('Close'), findsNothing);
      await t.sendKeyEvent(LogicalKeyboardKey.escape);
      await t.tapAt(const Offset(5, 5));
      await t.pumpAndSettle();
      expect(find.byType(CmModal), findsOneWidget);
      await t.tap(find.text('Accept'));
      await t.pumpAndSettle();
      expect(find.byType(CmModal), findsNothing);
    });

    testWidgets('Tab stays inside the modal', (t) async {
      await t.pumpWidget(app((context) => showCmModal<void>(
            context: context,
            title: 'Trap',
            builder: (_) => const Text('Body'),
            actions: (ctx) => [CmButton(label: 'Cancel', onPressed: () => Navigator.pop(ctx)), CmButton(label: 'Save', onPressed: () => Navigator.pop(ctx))],
          )));
      await openWithKeyboard(t, 'Open');
      for (var i = 0; i < 7; i++) {
        await t.sendKeyEvent(LogicalKeyboardKey.tab);
        await t.pump();
        final focused = FocusManager.instance.primaryFocus!.context!;
        expect(find.descendant(of: find.byType(CmModal), matching: find.byWidget(focused.widget)), findsWidgets, reason: 'tab $i stayed in the modal');
      }
    });

    testWidgets('semantics: a named dialog that scopes its route; the page behind is hidden', (t) async {
      final handle = t.ensureSemantics();
      await t.pumpWidget(app((context) => showCmModal<void>(context: context, title: 'Cancel order #1042?', builder: (_) => const Text('Body')), label: 'Cancel order'));
      expect(treeLabels(t), contains('Cancel order'));
      await t.tap(find.text('Cancel order'));
      await t.pumpAndSettle();
      final d = dialogNamed(t, 'Cancel order #1042?');
      expect(d.role, SemanticsRole.dialog);
      expect(d.hasFlag(SemanticsFlag.scopesRoute), isTrue);
      expect(d.hasFlag(SemanticsFlag.namesRoute), isTrue);
      expect(t.getSemantics(find.text('Cancel order #1042?')).getSemanticsData().hasFlag(SemanticsFlag.isHeader), isTrue);
      expect(semanticsOf(t, 'Close').hasFlag(SemanticsFlag.isButton), isTrue);
      expect(treeLabels(t), isNot(contains('Cancel order')), reason: 'the opener behind the dim is hidden from screen readers');
      expect(treeLabels(t), contains('Cancel order #1042?'));
      handle.dispose();
    });

    testWidgets('a field with autofocus gets focus on opening, as on the web', (t) async {
      final node = FocusNode(debugLabel: 'tracking');
      addTearDown(node.dispose);
      await t.pumpWidget(app((context) => showCmModal<void>(context: context, title: 'Change tracking info', builder: (_) => TextField(focusNode: node, autofocus: true))));
      await t.tap(find.text('Open'));
      await t.pumpAndSettle();
      expect(node.hasPrimaryFocus, isTrue);
    });

    testWidgets('phones: 16px from each side', (t) async {
      size(t, const Size(390, 844));
      await t.pumpWidget(app((context) => showCmModal<void>(context: context, title: 'Delete product?', builder: (_) => const Text('Body'))));
      await t.tap(find.text('Open'));
      await t.pumpAndSettle();
      final panel = find.ancestor(of: find.text('Delete product?'), matching: find.byType(Material)).first;
      expect(t.getSize(panel).width, 390 - 32);
      expect(t.getTopLeft(panel).dx, 16);
    });
  });

  group('side panel', () {
    testWidgets('full height on the end edge; result value; Esc closes', (t) async {
      size(t, const Size(1280, 900));
      Future<String?>? result;
      await t.pumpWidget(app((context) => result = showCmSidePanel<String>(
            context: context,
            title: 'Order #1042',
            builder: (_) => const Text('Rs. 2,340, paid'),
            actions: (ctx) => [CmButton(label: 'Mark as shipped', variant: CmButtonVariant.primary, onPressed: () => Navigator.pop(ctx, 'shipped'))],
          )));
      await t.tap(find.text('Open'));
      await t.pumpAndSettle();
      final panel = find.ancestor(of: find.text('Order #1042'), matching: find.byType(Material)).first;
      expect(t.getSize(panel), const Size(450, 900));
      expect(t.getTopRight(panel).dx, 1280);
      await t.tap(find.text('Mark as shipped'));
      await t.pumpAndSettle();
      expect(await result, 'shipped');

      await t.tap(find.text('Open'));
      await t.pumpAndSettle();
      await t.sendKeyEvent(LogicalKeyboardKey.escape);
      await t.pumpAndSettle();
      expect(find.byType(CmSidePanel), findsNothing);
      expect(await result, isNull);
    });

    testWidgets('phones: a card inset 16px from the screen edges', (t) async {
      size(t, const Size(390, 844));
      await t.pumpWidget(app((context) => showCmSidePanel<void>(context: context, title: 'Inquiry', size: CmOverlaySize.large, builder: (_) => const Text('Body'))));
      await t.tap(find.text('Open'));
      await t.pumpAndSettle();
      final panel = find.ancestor(of: find.text('Inquiry'), matching: find.byType(Material)).first;
      expect(t.getRect(panel), const Rect.fromLTRB(16, 16, 390 - 16, 844 - 16));
    });
  });

  group('filter panel', () {
    testWidgets('Search applies with the query and closes; Reset resets and redraws', (t) async {
      size(t, const Size(1280, 900));
      String? status = 'paid';
      var resets = 0;
      String? applied;
      Future<String?>? result;
      await t.pumpWidget(app((context) => result = showCmFilterPanel(
            context: context,
            search: true,
            appliedCount: 1,
            fields: (context, setState) => [
              Text('Status: ${status ?? 'Any'}'),
              CmButton(label: 'Pick pending', onPressed: () => setState(() => status = 'pending')),
            ],
            onReset: () {
              resets++;
              status = null;
            },
            onApply: (q) {
              applied = q;
              return true;
            },
          )));
      await t.tap(find.text('Open'));
      await t.pumpAndSettle();
      expect(find.text('Search and Filter'), findsOneWidget);
      expect(find.text('1 applied'), findsOneWidget);
      expect(find.text('Status: paid'), findsOneWidget);
      await t.tap(find.text('Pick pending'));
      await t.pump();
      expect(find.text('Status: pending'), findsOneWidget);
      await t.enterText(find.byType(TextField), '1042');
      await t.tap(find.text('Reset'));
      await t.pump();
      expect(resets, 1);
      expect(find.text('Status: Any'), findsOneWidget, reason: 'fields redraw after reset');
      expect(find.text('1042'), findsNothing, reason: 'reset clears the search');
      await t.enterText(find.byType(TextField), 'Robinson');
      await t.tap(find.text('Search'));
      await t.pumpAndSettle();
      expect(applied, 'Robinson');
      expect(await result, 'Robinson');
      expect(find.byType(CmFilterPanel), findsNothing);
    });

    testWidgets('Enter in the search field applies; onApply returning false keeps it open', (t) async {
      var allow = false;
      Future<String?>? result;
      await t.pumpWidget(app((context) => result = showCmFilterPanel(context: context, search: true, fields: (_, __) => const [], onApply: (_) => allow)));
      await t.tap(find.text('Open'));
      await t.pumpAndSettle();
      await t.tap(find.text('Search'));
      await t.pumpAndSettle();
      expect(find.byType(CmFilterPanel), findsOneWidget, reason: 'onApply returned false');
      allow = true;
      await t.enterText(find.byType(TextField), 'kurta');
      await t.testTextInput.receiveAction(TextInputAction.search);
      await t.pumpAndSettle();
      expect(find.byType(CmFilterPanel), findsNothing);
      expect(await result, 'kurta');
    });

    testWidgets('semantics name includes the applied count; phones inset 16px', (t) async {
      final handle = t.ensureSemantics();
      size(t, const Size(390, 844));
      await t.pumpWidget(app((context) => showCmFilterPanel(context: context, appliedCount: 2, fields: (_, __) => const [Text('Fields')])));
      await t.tap(find.text('Open'));
      await t.pumpAndSettle();
      expect(dialogNamed(t, 'Search and Filter, 2 applied').role, SemanticsRole.dialog);
      final panel = find.ancestor(of: find.text('Search and Filter'), matching: find.byType(Material)).first;
      expect(t.getRect(panel).left, 16);
      expect(t.getRect(panel).right, 390 - 16);
      handle.dispose();
    });
  });

  group('action menu', () {
    const items = [
      CmMenuItem(label: 'Cancel shipment', value: 'cancel'),
      CmMenuItem(label: 'Change tracking info', value: 'tracking'),
      CmMenuItem(label: 'Print label', value: 'print', disabled: true),
      CmMenuItem.divider(),
      CmMenuItem(label: 'Delete order', value: 'delete', critical: true),
    ];

    Widget menu(ValueChanged<CmMenuItem> onSelected) => MaterialApp(
          theme: CmTheme.light(),
          home: Scaffold(
            body: Center(
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                CmActionMenu(iconOnly: true, label: 'Order #1042 actions', items: items, onSelected: onSelected),
                const SizedBox(height: 200),
                CmButton(label: 'After', onPressed: () {}),
              ]),
            ),
          ),
        );

    String? focusedLabel() => FocusManager.instance.primaryFocus?.debugLabel;

    testWidgets('tap opens it on the first choice; tap chooses; tap outside closes', (t) async {
      CmMenuItem? chosen;
      await t.pumpWidget(menu((it) => chosen = it));
      expect(find.text('Cancel shipment'), findsNothing);
      await t.tap(find.bySemanticsLabel('Order #1042 actions'));
      await t.pumpAndSettle();
      expect(find.text('Cancel shipment'), findsOneWidget);
      expect(focusedLabel(), 'CmActionMenu item 0');
      await t.tap(find.text('Change tracking info'));
      await t.pumpAndSettle();
      expect(chosen?.id, 'tracking');
      expect(find.text('Cancel shipment'), findsNothing);
      expect(focusedLabel(), 'CmActionMenu trigger');

      await t.tap(find.bySemanticsLabel('Order #1042 actions'));
      await t.pumpAndSettle();
      await t.tapAt(const Offset(5, 5));
      await t.pumpAndSettle();
      expect(find.text('Cancel shipment'), findsNothing);
    });

    testWidgets('keyboard: arrows open and move (skipping disabled, wrapping), Home/End, letters, Enter, Esc', (t) async {
      CmMenuItem? chosen;
      await t.pumpWidget(menu((it) => chosen = it));
      await t.sendKeyEvent(LogicalKeyboardKey.tab);
      await t.pump();
      expect(focusedLabel(), 'CmActionMenu trigger');
      await t.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await t.pumpAndSettle();
      expect(focusedLabel(), 'CmActionMenu item 0');
      await t.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await t.pumpAndSettle();
      expect(focusedLabel(), 'CmActionMenu item 1');
      await t.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await t.pumpAndSettle();
      expect(focusedLabel(), 'CmActionMenu item 4', reason: 'disabled item and divider skipped');
      await t.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await t.pumpAndSettle();
      expect(focusedLabel(), 'CmActionMenu item 0', reason: 'wraps');
      await t.sendKeyEvent(LogicalKeyboardKey.arrowUp);
      await t.pumpAndSettle();
      expect(focusedLabel(), 'CmActionMenu item 4');
      await t.sendKeyEvent(LogicalKeyboardKey.home);
      await t.pumpAndSettle();
      expect(focusedLabel(), 'CmActionMenu item 0');
      await t.sendKeyEvent(LogicalKeyboardKey.end);
      await t.pumpAndSettle();
      expect(focusedLabel(), 'CmActionMenu item 4');
      await t.sendKeyEvent(LogicalKeyboardKey.keyC);
      await t.pumpAndSettle();
      expect(focusedLabel(), 'CmActionMenu item 0', reason: 'first letter jumps');
      await t.sendKeyEvent(LogicalKeyboardKey.escape);
      await t.pumpAndSettle();
      expect(find.text('Cancel shipment'), findsNothing);
      expect(focusedLabel(), 'CmActionMenu trigger', reason: 'Esc returns focus to the trigger');
      expect(chosen, isNull);

      await t.sendKeyEvent(LogicalKeyboardKey.arrowUp);
      await t.pumpAndSettle();
      expect(focusedLabel(), 'CmActionMenu item 4', reason: 'up opens on the last choice');
      await t.sendKeyEvent(LogicalKeyboardKey.arrowUp);
      await t.pumpAndSettle();
      await t.sendKeyEvent(LogicalKeyboardKey.enter);
      await t.pumpAndSettle();
      expect(chosen?.id, 'tracking');
      expect(find.text('Cancel shipment'), findsNothing);
      expect(focusedLabel(), 'CmActionMenu trigger');

      // Enter on the trigger opens; Tab closes and moves on.
      await t.sendKeyEvent(LogicalKeyboardKey.enter);
      await t.pumpAndSettle();
      expect(focusedLabel(), 'CmActionMenu item 0');
      await t.sendKeyEvent(LogicalKeyboardKey.tab);
      await t.pumpAndSettle();
      expect(find.text('Cancel shipment'), findsNothing);
      expect(buttonFocused(t, 'After'), isTrue);
    });

    testWidgets('semantics: expanded trigger, menu and menu items', (t) async {
      final handle = t.ensureSemantics();
      await t.pumpWidget(menu((_) {}));
      final trigger = semanticsOf(t, 'Order #1042 actions');
      expect(trigger.hasFlag(SemanticsFlag.isButton), isTrue);
      expect(trigger.hasFlag(SemanticsFlag.hasExpandedState), isTrue);
      expect(trigger.hasFlag(SemanticsFlag.isExpanded), isFalse);
      await t.tap(find.bySemanticsLabel('Order #1042 actions'));
      await t.pumpAndSettle();
      expect(semanticsOf(t, 'Cancel shipment').role, SemanticsRole.menuItem);
      expect(semanticsOf(t, 'Print label').hasFlag(SemanticsFlag.isEnabled), isFalse);
      expect(t.getSemantics(find.bySemanticsLabel('Order #1042 actions').first).getSemanticsData().hasFlag(SemanticsFlag.isExpanded), isTrue);
      handle.dispose();
    });

    testWidgets('stays inside the screen at the right edge', (t) async {
      size(t, const Size(390, 844));
      await t.pumpWidget(MaterialApp(
        theme: CmTheme.light(),
        home: const Scaffold(body: Align(alignment: Alignment.topRight, child: CmActionMenu(label: 'Account', heading: 'Robinson Jain', subheading: 'robinson@example.com', items: items))),
      ));
      await t.tap(find.text('Account'));
      await t.pumpAndSettle();
      expect(find.text('robinson@example.com'), findsOneWidget);
      final menu = find.ancestor(of: find.text('Cancel shipment'), matching: find.byType(Material)).first;
      expect(t.getRect(menu).right, lessThanOrEqualTo(390 - 16));
      expect(t.takeException(), isNull);
    });
  });

  group('bottom sheet', () {
    testWidgets('rows choose and return their id; Esc closes; focus returns', (t) async {
      size(t, const Size(390, 844));
      Future<String?>? result;
      CmMenuItem? chosen;
      await t.pumpWidget(app((context) => result = showCmBottomSheet(
            context: context,
            heading: 'Share order',
            onSelected: (it) => chosen = it,
            items: const [
              CmMenuItem(label: 'Copy link', value: 'copy', icon: CmIcons.copy),
              CmMenuItem(label: 'Share on WhatsApp', value: 'whatsapp', icon: CmIcons.share),
            ],
          )));
      await t.tap(find.text('Open'));
      await t.pumpAndSettle();
      final sheet = find.ancestor(of: find.text('Copy link'), matching: find.byType(Material)).first;
      expect(t.getRect(sheet).bottom, 844 - 20, reason: 'rows sit inside 20px padding at the bottom edge');
      expect(t.getRect(sheet).width, 390 - 40);
      await t.tap(find.text('Share on WhatsApp'));
      await t.pumpAndSettle();
      expect(chosen?.id, 'whatsapp');
      expect(await result, 'whatsapp');

      await openWithKeyboard(t, 'Open');
      await t.sendKeyEvent(LogicalKeyboardKey.escape);
      await t.pumpAndSettle();
      expect(find.byType(CmBottomSheet), findsNothing);
      expect(await result, isNull);
      expect(buttonFocused(t, 'Open'), isTrue);
    });

    testWidgets('semantics: named by the hidden heading; close button tappable on its top half', (t) async {
      final handle = t.ensureSemantics();
      size(t, const Size(390, 844));
      await t.pumpWidget(app((context) => showCmBottomSheet(context: context, heading: 'Order actions', items: const [CmMenuItem(label: 'Mark as paid order')])));
      await t.tap(find.text('Open'));
      await t.pumpAndSettle();
      expect(dialogNamed(t, 'Order actions').role, SemanticsRole.dialog);
      expect(find.text('Order actions'), findsNothing, reason: 'the heading is not shown');
      final close = t.getRect(find.bySemanticsLabel('Close'));
      expect(close.width, 36);
      await t.tapAt(close.topCenter + const Offset(0, 4));
      await t.pumpAndSettle();
      expect(find.byType(CmBottomSheet), findsNothing);
      handle.dispose();
    });

    testWidgets('at most 600px wide on larger screens', (t) async {
      size(t, const Size(1280, 900));
      await t.pumpWidget(app((context) => showCmBottomSheet(context: context, heading: 'Actions', items: const [CmMenuItem(label: 'Generate invoice')])));
      await t.tap(find.text('Open'));
      await t.pumpAndSettle();
      final sheet = find.ancestor(of: find.text('Generate invoice'), matching: find.byType(Material)).first;
      expect(t.getSize(sheet).width, 600 - 40, reason: 'inside 20px padding');
    });
  });

  group('notification panel', () {
    const notes = [
      CmNotification(label: 'New order received', time: '1 min ago', unread: true, value: 'order-1042'),
      CmNotification(label: 'Product low stock', time: '12 mins ago', tone: CmTone.attention),
      CmNotification(label: 'Order cancelled', time: '1 day ago', tone: CmTone.critical),
    ];

    testWidgets('rows return the notification; more link; position', (t) async {
      size(t, const Size(1280, 900));
      Future<CmNotification?>? result;
      var more = 0;
      await t.pumpWidget(app((context) => result = showCmNotificationPanel(context: context, notifications: notes, onMore: () => more++)));
      await t.tap(find.text('Open'));
      await t.pumpAndSettle();
      final panel = find.ancestor(of: find.text('Notifications'), matching: find.byType(Material)).first;
      expect(t.getRect(panel).top, 64);
      expect(t.getRect(panel).right, 1280 - 20);
      expect(t.getRect(panel).width, 380);
      await t.tap(find.text('Product low stock'));
      await t.pumpAndSettle();
      expect((await result)?.label, 'Product low stock');

      await t.tap(find.text('Open'));
      await t.pumpAndSettle();
      await t.tap(find.text('See more notifications'));
      await t.pumpAndSettle();
      expect(more, 1);
      expect(find.byType(CmNotificationPanel), findsNothing);
    });

    testWidgets('semantics: unread is read out; Esc closes and returns focus', (t) async {
      final handle = t.ensureSemantics();
      await t.pumpWidget(app((context) => showCmNotificationPanel(context: context, notifications: notes)));
      await openWithKeyboard(t, 'Open');
      expect(dialogNamed(t, 'Notifications').role, SemanticsRole.dialog);
      expect(semanticsOf(t, 'Unread: New order received, 1 min ago').hasFlag(SemanticsFlag.isButton), isTrue);
      expect(find.bySemanticsLabel('Product low stock, 12 mins ago'), findsOneWidget);
      await t.sendKeyEvent(LogicalKeyboardKey.escape);
      await t.pumpAndSettle();
      expect(find.byType(CmNotificationPanel), findsNothing);
      expect(buttonFocused(t, 'Open'), isTrue);
      handle.dispose();
    });

    testWidgets('phones: screen width less 8px each side; empty text', (t) async {
      size(t, const Size(390, 844));
      await t.pumpWidget(app((context) => showCmNotificationPanel(context: context, notifications: const [])));
      await t.tap(find.text('Open'));
      await t.pumpAndSettle();
      expect(find.text('No notifications yet.'), findsOneWidget);
      final panel = find.ancestor(of: find.text('Notifications'), matching: find.byType(Material)).first;
      expect(t.getRect(panel).left, 8);
      expect(t.getRect(panel).right, 390 - 8);
      expect(t.getRect(panel).top, 56);
    });
  });
}
