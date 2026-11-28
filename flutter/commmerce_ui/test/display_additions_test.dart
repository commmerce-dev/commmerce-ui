import 'package:commmerce_ui/commmerce_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';

Widget app(Widget child, {ThemeData? theme, TextDirection dir = TextDirection.ltr, double width = 600, bool use24 = false}) => MaterialApp(
      theme: theme ?? CmTheme.light(),
      builder: (context, child) => MediaQuery(data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: use24), child: child!),
      home: Directionality(
        textDirection: dir,
        child: Scaffold(body: SingleChildScrollView(child: Align(alignment: AlignmentDirectional.topStart, child: SizedBox(width: width, child: child)))),
      ),
    );

void main() {
  group('notification panel (1.1)', () {
    const items = [
      CmNotification(label: 'Follow-up due', description: 'Asha Rao, at 4 pm', icon: CmIcons.clock, time: '5 min', unread: true),
      CmNotification(label: 'Deal won', tone: CmTone.success, time: '1 h'),
    ];

    testWidgets('description and icon; "Mark all read" while something is unread; footer', (t) async {
      final handle = t.ensureSemantics();
      var marked = 0;
      await t.pumpWidget(app(SizedBox(
        height: 600,
        child: CmNotificationPanel(notifications: items, onMarkAllRead: () => marked++, onClose: () {}, footer: const Text('Push notifications on this device')),
      )));
      expect(find.text('Asha Rao, at 4 pm'), findsOneWidget);
      expect(find.bySemanticsLabel('Unread: Follow-up due, Asha Rao, at 4 pm, 5 min'), findsOneWidget);
      expect(find.byWidgetPredicate((w) => w is CmIcon && w.name == CmIcons.clock), findsOneWidget, reason: 'the item icon replaces the tone icon');
      expect(find.text('Push notifications on this device'), findsOneWidget);
      await t.tap(find.bySemanticsLabel('Mark all read'));
      await t.pump();
      expect(marked, 1);
      expect(find.text('Mark all read'), findsNothing, reason: 'hidden once nothing is unread');
      expect(find.bySemanticsLabel('Follow-up due, Asha Rao, at 4 pm, 5 min'), findsOneWidget);
      handle.dispose();
    });

    testWidgets('loading: placeholder rows, announced, no Mark all read', (t) async {
      final handle = t.ensureSemantics();
      await t.pumpWidget(app(SizedBox(height: 600, child: CmNotificationPanel(notifications: items, loading: true, onMarkAllRead: () {}, onClose: () {})), theme: CmTheme.dark()));
      expect(find.byType(CmSkeleton), findsNWidgets(6));
      expect(find.text('Follow-up due'), findsNothing);
      expect(find.text('Mark all read'), findsNothing);
      expect(find.bySemanticsLabel('Loading'), findsOneWidget);
      handle.dispose();
    });

    testWidgets('showCmNotificationPanel loads with a future', (t) async {
      await t.pumpWidget(MaterialApp(
        theme: CmTheme.light(),
        home: Scaffold(body: Builder(builder: (context) => CmButton(label: 'Bell', onPressed: () => showCmNotificationPanel(context: context, notifications: const [], load: Future.delayed(const Duration(seconds: 1), () => items))))),
      ));
      await t.tap(find.text('Bell'));
      await t.pump(const Duration(milliseconds: 300));
      expect(find.byType(CmSkeleton), findsWidgets);
      await t.pump(const Duration(seconds: 1));
      await t.pump(const Duration(milliseconds: 300));
      expect(find.text('Deal won'), findsOneWidget);
    });
  });

  group('empty state inline (1.2)', () {
    testWidgets('one line, small icon, heading, text and a text action; RTL', (t) async {
      final handle = t.ensureSemantics();
      var added = 0;
      await t.pumpWidget(app(CmEmptyState(inline: true, heading: 'No tasks.', message: 'Tasks you add show here.', icon: CmIcons.tasks, actionLabel: 'Add task', onAction: () => added++), width: 900));
      expect(t.getSize(find.byType(CmEmptyState)).height, lessThanOrEqualTo(24), reason: 'one line, no circle');
      expect(t.widget<CmIcon>(find.byType(CmIcon)).size, 20);
      expect(t.getSemantics(find.bySemanticsLabel('No tasks.')).getSemanticsData().hasFlag(SemanticsFlag.isHeader), isTrue);
      expect(find.bySemanticsLabel(RegExp(r'^\s*Tasks you add show here\.$')), findsOneWidget);
      await t.tap(find.bySemanticsLabel('Add task'));
      expect(added, 1);
      await t.pumpWidget(app(const CmEmptyState(inline: true, heading: 'No tasks.', icon: ''), dir: TextDirection.rtl));
      expect(find.byType(CmIcon), findsNothing);
      expect(t.getRect(find.text('No tasks.')).right, t.getRect(find.byType(CmEmptyState)).right);
      handle.dispose();
    });
  });

  group('narrow card and page header (1.2)', () {
    testWidgets('card: actions move under a title that would be squeezed; badges wrap under the heading', (t) async {
      Future<void> pump(double width) => t.pumpWidget(app(CmCard(
            heading: 'Recent activity',
            adornment: const CmBadge('3 new', tone: CmTone.attention),
            actions: [CmButton(label: 'View all activity', onPressed: () {})],
            child: const Text('Body'),
          ), width: width));
      await pump(900);
      final wideTitle = t.getRect(find.text('Recent activity'));
      expect((t.getRect(find.text('View all activity')).center.dy - wideTitle.center.dy).abs(), lessThan(20), reason: 'one row');
      await pump(300);
      final title = t.getRect(find.text('Recent activity'));
      expect(t.getRect(find.text('View all activity')).top, greaterThan(title.bottom), reason: 'actions under the title');
      expect(title.width, greaterThan(100), reason: 'the title is not squeezed');
      expect(t.getRect(find.text('3 new')).top, greaterThanOrEqualTo(title.top));
    });

    testWidgets('page header: actions wrap below and badges below the title on narrow screens; RTL', (t) async {
      t.view.physicalSize = const Size(360, 800);
      t.view.devicePixelRatio = 1;
      addTearDown(t.view.reset);
      Widget header() => CmPageHeader(
            title: 'Asha Rao, Rao Textiles Pvt Ltd',
            breadcrumbs: const [CmBreadcrumb('Leads')],
            adornment: const CmBadge('Hot', tone: CmTone.critical),
            actions: [CmButton(label: 'Convert to deal', variant: CmButtonVariant.primary, onPressed: () {}), CmButton(label: 'Log call', onPressed: () {})],
          );
      await t.pumpWidget(app(header(), width: 360));
      final title = t.getRect(find.text('Asha Rao, Rao Textiles Pvt Ltd'));
      expect(t.getRect(find.text('Convert to deal')).top, greaterThan(title.bottom));
      expect(title.width, greaterThan(160));
      // The actions sit at the end side.
      // 16px header padding, the button's 2px touch margin, its 1px border and 16px padding.
      expect(t.getRect(find.text('Log call')).right, closeTo(360 - 16 - 2 - 1 - 16, 2));
      await t.pumpWidget(app(header(), width: 360, dir: TextDirection.rtl));
      expect(t.getRect(find.text('Log call')).left, lessThan(60));
    });
  });

  group('date picker with time (1.2)', () {
    testWidgets('shows the date and the time in the locale clock; time box named "Time for …"', (t) async {
      final handle = t.ensureSemantics();
      await t.pumpWidget(app(CmDatePicker(label: 'Follow up', time: true, value: DateTime(2026, 11, 16, 15, 30), firstDate: DateTime(2026), lastDate: DateTime(2027), onChanged: (_) {})));
      expect(find.text('Nov 16, 2026'), findsOneWidget);
      expect(find.text('3:30 PM'), findsOneWidget);
      final time = t.getSemantics(find.bySemanticsLabel('Time for Follow up')).getSemanticsData();
      expect(time.value, '3:30 PM');
      expect(time.hasFlag(SemanticsFlag.isButton), isTrue);
      await t.pumpWidget(app(CmDatePicker(label: 'Follow up', time: true, value: DateTime(2026, 11, 16, 15, 30), firstDate: DateTime(2026), lastDate: DateTime(2027), onChanged: (_) {}), use24: true));
      await t.pumpAndSettle();
      expect(find.text('15:30'), findsOneWidget);
      await t.pumpWidget(app(CmDatePicker(label: 'Follow up', time: true, value: null, firstDate: DateTime(2026), lastDate: DateTime(2027), onChanged: (_) {})));
      await t.pumpAndSettle();
      expect(find.text('hh:mm am'), findsOneWidget, reason: 'the placeholder pattern for a 12-hour clock');
      // The time box sits at the end side of the date box.
      expect(t.getRect(find.text('hh:mm am')).left, greaterThan(t.getRect(find.text('Choose a date')).right));
      handle.dispose();
    });

    testWidgets('a picked time moves onto the step', (t) async {
      DateTime? got;
      await t.pumpWidget(app(CmDatePicker(label: 'Call at', time: true, step: 15, value: DateTime(2026, 11, 20, 15, 37), firstDate: DateTime(2026), lastDate: DateTime(2027), onChanged: (v) => got = v)));
      await t.tap(find.bySemanticsLabel('Time for Call at'));
      await t.pumpAndSettle();
      await t.tap(find.text('OK'));
      await t.pumpAndSettle();
      expect(got, DateTime(2026, 11, 20, 15, 30));
    });

    testWidgets('minNow: nothing earlier than now can be chosen', (t) async {
      DateTime? got;
      final yesterday = DateTime.now().subtract(const Duration(days: 1));
      await t.pumpWidget(app(CmDatePicker(label: 'Remind me', time: true, minNow: true, value: DateTime(yesterday.year, yesterday.month, yesterday.day, 9), firstDate: DateTime(2026), lastDate: DateTime(2100), onChanged: (v) => got = v)));
      await t.tap(find.bySemanticsLabel('Time for Remind me'));
      await t.pumpAndSettle();
      await t.tap(find.text('OK'));
      await t.pumpAndSettle();
      expect(got!.isBefore(DateTime.now().subtract(const Duration(minutes: 1))), isFalse);
    });

    testWidgets('choosing a date with no time set opens the time picker next', (t) async {
      DateTime? got;
      await t.pumpWidget(app(CmDatePicker(label: 'Meeting', time: true, value: null, firstDate: DateTime(2020), lastDate: DateTime(2100), onChanged: (v) => got = v)));
      await t.tap(find.bySemanticsLabel(RegExp('^Meeting')));
      await t.pumpAndSettle();
      await t.tap(find.text('OK'));
      await t.pumpAndSettle();
      expect(got, isNull, reason: 'a date alone is not a value yet');
      expect(find.text('Time for Meeting'), findsOneWidget, reason: 'the time picker is open');
      await t.tap(find.text('OK'));
      await t.pumpAndSettle();
      expect(got, isNotNull);
    });
  });

  testWidgets('the new built-in text is translated through CmLocalizations', (t) async {
    final handle = t.ensureSemantics();
    String withCount(String label, int n) => '$label, $n non lus';
    await t.pumpWidget(CmLocalizations(
      strings: CmStrings(buttonLabelWithCount: withCount, showMore: 'Voir plus', timelineLabel: 'Activité', seeAll: 'Tout voir', markAllRead: 'Tout marquer comme lu'),
      child: app(Column(children: [
        CmButton.iconOnly(icon: CmIcons.bell, label: 'Notifications', count: 2, onPressed: () {}),
        CmTimeline(hasMore: true, onLoadMore: () {}, items: const [CmTimelineItem(heading: 'Appel', time: 'hier')]),
        SizedBox(height: 300, child: CmNotificationPanel(notifications: const [CmNotification(label: 'Commande', unread: true)], onMarkAllRead: () {}, onClose: () {})),
      ])),
    ));
    expect(find.bySemanticsLabel('Notifications, 2 non lus'), findsOneWidget);
    expect(find.text('Voir plus'), findsOneWidget);
    expect(find.bySemanticsLabel('Activité'), findsOneWidget);
    expect(find.text('Tout marquer comme lu'), findsOneWidget);
    handle.dispose();
  });
}
