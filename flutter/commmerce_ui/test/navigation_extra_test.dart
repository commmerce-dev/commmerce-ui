import 'package:commmerce_ui/commmerce_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

Widget app(Widget child, {Size size = const Size(1280, 900)}) => MediaQuery(
      data: MediaQueryData(size: size),
      child: MaterialApp(theme: CmTheme.light(), home: Scaffold(body: Center(child: SingleChildScrollView(child: child)))),
    );

void phone(WidgetTester t) {
  t.view.physicalSize = const Size(390, 844);
  t.view.devicePixelRatio = 1;
  addTearDown(t.view.reset);
}

const tabs = [
  CmNavItem(id: 'home', label: 'Home', icon: CmIcons.home),
  CmNavItem(id: 'products', label: 'Products', icon: CmIcons.box),
  CmNavItem(id: 'add', label: 'Quick add', icon: CmIcons.plus, primary: true),
  CmNavItem(id: 'orders', label: 'Orders', icon: CmIcons.bag),
  CmNavItem(id: 'more', label: 'More', icon: CmIcons.more),
  CmNavItem(id: 'extra', label: 'Extra', icon: CmIcons.star),
];

const sections = [
  CmMenuSection(label: 'Channels', items: [
    CmNavItem(id: 'online-store', label: 'Online Store', icon: CmIcons.store),
    CmNavItem(id: 'add-channel', label: 'Add channel', primary: true),
  ]),
  CmMenuSection(label: 'Panels', items: [
    CmNavItem(id: 'apps', label: 'Application', icon: CmIcons.apps, badge: '3 apps active'),
  ]),
  CmMenuSection(items: [
    CmNavItem(id: 'settings', label: 'Settings', icon: CmIcons.settings, children: [
      CmNavItem(id: 'shipping', label: 'Shipping'),
      CmNavItem(id: 'tax', label: 'Tax'),
    ]),
  ]),
];

void main() {
  testWidgets('bottom navigation: five items, selected state, taps', (t) async {
    final handle = t.ensureSemantics();
    phone(t);
    var current = 'home';
    await t.pumpWidget(app(StatefulBuilder(builder: (c, set) => CmBottomNavigation(items: tabs, selectedId: current, onSelected: (i) => set(() => current = i.id))), size: const Size(390, 844)));
    expect(find.text('Extra'), findsNothing, reason: 'only five items');
    expect(find.text('Orders'), findsOneWidget);
    await t.tap(find.text('Orders'));
    await t.pump();
    expect(current, 'orders');
    expect(t.getSemantics(find.bySemanticsLabel('Orders')).getSemanticsData().hasFlag(SemanticsFlag.isSelected), isTrue);
    expect(t.getSemantics(find.bySemanticsLabel('Home')).getSemanticsData().hasFlag(SemanticsFlag.isSelected), isFalse);
    // Each item gets a fifth of the phone width and at least 48px of height.
    final item = t.getSize(find.ancestor(of: find.text('Home'), matching: find.byType(InkWell)));
    expect(item.width, closeTo((390 - 12) / 5, 1));
    expect(item.height, greaterThanOrEqualTo(48));
    handle.dispose();
  });

  testWidgets('link tabs: current tab is selected; keyboard moves between tabs', (t) async {
    final handle = t.ensureSemantics();
    var current = 'details';
    await t.pumpWidget(app(StatefulBuilder(builder: (c, set) => CmLinkTabs(
          semanticLabel: 'Product sections',
          selectedId: current,
          onSelected: (i) => set(() => current = i.id),
          tabs: const [CmNavItem(id: 'details', label: 'Details'), CmNavItem(id: 'variants', label: 'Variants', count: 12), CmNavItem(id: 'inventory', label: 'Inventory')],
        ))));
    expect(find.text('(12)'), findsOneWidget);
    final details = t.getSemantics(find.bySemanticsLabel('Details')).getSemanticsData();
    expect(details.hasFlag(SemanticsFlag.isSelected), isTrue);
    expect(details.hasFlag(SemanticsFlag.isLink), isTrue);
    await t.sendKeyEvent(LogicalKeyboardKey.tab);
    await t.sendKeyEvent(LogicalKeyboardKey.tab);
    await t.sendKeyEvent(LogicalKeyboardKey.enter);
    await t.pump();
    expect(current, 'variants');
    handle.dispose();
  });

  testWidgets('link tabs scroll sideways on a phone instead of wrapping', (t) async {
    phone(t);
    await t.pumpWidget(app(CmLinkTabs(
      selectedId: 'general',
      onSelected: (_) {},
      tabs: const [
        CmNavItem(id: 'general', label: 'General'), CmNavItem(id: 'payments', label: 'Payments'), CmNavItem(id: 'shipping', label: 'Shipping'),
        CmNavItem(id: 'taxes', label: 'Taxes'), CmNavItem(id: 'notifications', label: 'Notifications'), CmNavItem(id: 'domains', label: 'Domains'),
      ],
    ), size: const Size(390, 844)));
    expect(t.takeException(), isNull);
    expect(t.getTopLeft(find.text('Domains')).dy, t.getTopLeft(find.text('General')).dy);
    expect(find.byType(SingleChildScrollView), findsNWidgets(2));
  });

  testWidgets('mobile menu: rows navigate, sub-page opens and Escape goes back', (t) async {
    final handle = t.ensureSemantics();
    phone(t);
    final chosen = <String>[];
    var stores = 0;
    await t.pumpWidget(app(
      CmMobileMenu(sections: sections, store: 'Obiroye Garments', userName: 'Robinson Jain', userEmail: 'robinson@example.com', onStoreTap: () => stores++, onSelected: (i) => chosen.add(i.id)),
      size: const Size(390, 844),
    ));
    expect(find.text('Profile'), findsOneWidget);
    expect(find.text('R'), findsOneWidget, reason: 'avatar initial');
    expect(find.text('3 apps active'), findsOneWidget);
    await t.tap(find.text('Obiroye Garments'));
    expect(stores, 1);
    await t.tap(find.text('Online Store'));
    await t.tap(find.text('Add channel'));
    expect(chosen, ['online-store', 'add-channel']);

    await t.tap(find.text('Settings'));
    await t.pump();
    await t.pump();
    expect(find.text('Shipping'), findsOneWidget);
    expect(find.text('Profile'), findsNothing);
    expect(FocusManager.instance.primaryFocus?.debugLabel, 'CmMobileMenu back');
    await t.tap(find.text('Tax'));
    expect(chosen.last, 'tax');
    await t.sendKeyEvent(LogicalKeyboardKey.escape);
    await t.pump();
    await t.pump();
    expect(find.text('Profile'), findsOneWidget);
    expect(FocusManager.instance.primaryFocus?.debugLabel, startsWith('CmMobileMenu row'), reason: 'focus returns to the row');
    handle.dispose();
  });

  testWidgets('flash offer bar: link fires, dismiss hides it, region is named', (t) async {
    var links = 0, dismissed = 0;
    await t.pumpWidget(app(CmFlashOfferBar(
      message: 'Festive sale: 20% off annual plans until 30 November. ',
      linkText: 'See plans',
      onLinkTap: () => links++,
      onDismiss: () => dismissed++,
    )));
    expect(find.bySemanticsLabel('Offer'), findsOneWidget);
    await t.tap(find.text('See plans'));
    expect(links, 1);
    await t.tap(find.bySemanticsLabel('Dismiss offer'));
    await t.pump();
    expect(dismissed, 1);
    expect(find.text('See plans'), findsNothing);
  });

  testWidgets('flash offer bar link works from the keyboard and text starts left on phones', (t) async {
    phone(t);
    var links = 0;
    await t.pumpWidget(app(CmFlashOfferBar(message: 'Publish your store with a Commmerce plan - ', linkText: 'Click here', trailing: ' to pick a plan', onLinkTap: () => links++), size: const Size(390, 844)));
    await t.sendKeyEvent(LogicalKeyboardKey.tab);
    await t.sendKeyEvent(LogicalKeyboardKey.enter);
    expect(links, 1);
    expect(t.getTopLeft(find.byType(CmIcon)).dx, lessThan(30));
  });
}
