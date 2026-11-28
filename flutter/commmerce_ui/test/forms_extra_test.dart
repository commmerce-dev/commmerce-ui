import 'package:commmerce_ui/commmerce_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

Widget app(Widget child, {Size size = const Size(1280, 900)}) => MediaQuery(
      data: MediaQueryData(size: size),
      child: MaterialApp(theme: CmTheme.light(), home: Scaffold(body: Center(child: SingleChildScrollView(child: child)))),
    );

const offerTypes = [
  CmRadioOption(value: 'orders', label: 'Orders over'),
  CmRadioOption(value: 'categories', label: 'Categories'),
  CmRadioOption(value: 'product', label: 'Specific product', enabled: false),
  CmRadioOption(value: 'customer', label: 'Customer group'),
];

void main() {
  testWidgets('option group: tap selects, checked state in semantics', (t) async {
    final handle = t.ensureSemantics();
    String? v = 'orders';
    await t.pumpWidget(app(StatefulBuilder(builder: (c, set) => CmOptionGroup<String>(label: 'Select offer type', options: offerTypes, value: v, onChanged: (x) => set(() => v = x)))));
    await t.tap(find.text('Categories'));
    await t.pump();
    expect(v, 'categories');
    expect(t.getSemantics(find.bySemanticsLabel('Categories')).getSemanticsData().hasFlag(SemanticsFlag.isChecked), isTrue);
    expect(t.getSemantics(find.bySemanticsLabel('Orders over')).getSemanticsData().hasFlag(SemanticsFlag.isChecked), isFalse);
    await t.tap(find.text('Specific product'));
    await t.pump();
    expect(v, 'categories', reason: 'disabled option is skipped');
    handle.dispose();
  });

  testWidgets('option group: one tab stop, arrows move and skip disabled options', (t) async {
    String? v = 'orders';
    await t.pumpWidget(app(Column(children: [
      StatefulBuilder(builder: (c, set) => CmOptionGroup<String>(semanticLabel: 'Offer type', options: offerTypes, value: v, onChanged: (x) => set(() => v = x))),
      CmButton(label: 'Next', onPressed: () {}),
    ])));
    await t.sendKeyEvent(LogicalKeyboardKey.tab);
    await t.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await t.pump();
    expect(v, 'categories');
    await t.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await t.pump();
    expect(v, 'customer');
    await t.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await t.pump();
    expect(v, 'orders', reason: 'wraps around');
    await t.sendKeyEvent(LogicalKeyboardKey.end);
    await t.pump();
    expect(v, 'customer');
    // Tab leaves the group in one step.
    await t.sendKeyEvent(LogicalKeyboardKey.tab);
    await t.pump();
    final focused = FocusManager.instance.primaryFocus!.context!;
    expect(focused.findAncestorWidgetOfExactType<CmButton>()?.label, 'Next');
  });

  testWidgets('option group is smaller on phones', (t) async {
    t.view.physicalSize = const Size(390, 844);
    t.view.devicePixelRatio = 1;
    addTearDown(t.view.reset);
    await t.pumpWidget(app(CmOptionGroup<String>(options: offerTypes, value: 'orders', onChanged: (_) {}), size: const Size(390, 844)));
    final box = find.ancestor(of: find.text('Orders over'), matching: find.byType(Container)).first;
    expect(t.getSize(box).height, 42);
  });

  testWidgets('file upload: picked files are filtered, shown and removable', (t) async {
    var files = <CmPickedFile>[];
    List<CmPickedFile>? refused;
    await t.pumpWidget(app(StatefulBuilder(builder: (c, set) => SizedBox(width: 800, child: CmFileUpload(
          label: 'Add product images',
          hint: 'max. file size 300 KB',
          accept: const ['image/*'],
          multiple: true,
          maxSize: 300 * 1024,
          files: files,
          onChanged: (f) => set(() => files = f),
          onReject: (r) => refused = r,
          onPick: () async => const [
            CmPickedFile(name: 'kurta-front.jpg', size: 120 * 1024, mimeType: 'image/jpeg'),
            CmPickedFile(name: 'banner.png', size: 900 * 1024, mimeType: 'image/png'),
            CmPickedFile(name: 'price-list.pdf', size: 40 * 1024, mimeType: 'application/pdf'),
          ],
        )))));
    expect(find.text('Drag files here or Browse', findRichText: true), findsOneWidget);
    expect(find.text('max. file size 300 KB'), findsOneWidget, reason: 'the hint sits in the empty row');
    await t.tap(find.text('Drag files here or Browse', findRichText: true));
    await t.pumpAndSettle();
    expect(files.map((f) => f.name), ['kurta-front.jpg']);
    expect(refused!.map((f) => f.name), ['banner.png', 'price-list.pdf']);
    expect(find.text('banner.png is larger than 300 KB. price-list.pdf is not an allowed file type'), findsOneWidget);
    expect(find.text('Add more'), findsOneWidget);
    await t.tap(find.bySemanticsLabel('Remove kurta-front.jpg'));
    await t.pumpAndSettle();
    expect(files, isEmpty);
    expect(find.text('Drag files here or Browse', findRichText: true), findsOneWidget);
  });

  testWidgets('file upload: single file replaces the zone; keyboard opens the picker; max files', (t) async {
    var files = <CmPickedFile>[];
    var picks = 0;
    await t.pumpWidget(app(StatefulBuilder(builder: (c, set) => SizedBox(width: 600, child: CmFileUpload(
          label: 'GST certificate',
          files: files,
          onChanged: (f) => set(() => files = f),
          onPick: () async { picks++; return const [CmPickedFile(name: 'gst.pdf', size: 2 * 1024 * 1024, mimeType: 'application/pdf')]; },
        )))));
    await t.sendKeyEvent(LogicalKeyboardKey.tab);
    await t.sendKeyEvent(LogicalKeyboardKey.enter);
    await t.pumpAndSettle();
    expect(picks, 1);
    expect(find.text('gst.pdf'), findsOneWidget);
    expect(find.text('2 MB'), findsOneWidget);
    expect(find.text('Add more'), findsNothing);
    expect(find.text('Drag files here or Browse', findRichText: true), findsNothing);

    final key = GlobalKey<CmFileUploadState>();
    var gallery = <CmPickedFile>[];
    await t.pumpWidget(app(StatefulBuilder(builder: (c, set) => SizedBox(width: 600, child: CmFileUpload(
          key: key, multiple: true, maxFiles: 2, files: gallery, onChanged: (f) => set(() => gallery = f),
        )))));
    key.currentState!.addFiles(const [CmPickedFile(name: 'a.jpg', size: 10), CmPickedFile(name: 'b.jpg', size: 10), CmPickedFile(name: 'c.jpg', size: 10)]);
    await t.pump();
    expect(gallery.length, 2);
    expect(find.text('You can add up to 2 files'), findsOneWidget);
  });

  testWidgets('file upload 1.6: a 72px empty row; drag-over; progress with Cancel; per-file errors', (t) async {
    final handle = t.ensureSemantics();
    final key = GlobalKey<CmFileUploadState>();
    var files = <CmPickedFile>[];
    final cancelled = <String>[];
    await t.pumpWidget(app(StatefulBuilder(builder: (c, set) => SizedBox(width: 600, child: CmFileUpload(
          key: key,
          label: 'Invoices',
          hint: 'PDF, up to 2 MB',
          multiple: true,
          files: files,
          onChanged: (f) => set(() => files = f),
          onCancel: (f) => cancelled.add(f.name),
          onPick: () async => null,
        )))));
    final zone = find.ancestor(of: find.text('PDF, up to 2 MB'), matching: find.byType(Container)).last;
    expect(t.getSize(zone).height, 72);
    key.currentState!.setDragOver(true);
    await t.pump();
    expect(find.text('Drop files to upload'), findsOneWidget);
    key.currentState!.setDragOver(false);
    await t.pump();

    const a = CmPickedFile(name: 'a.pdf', size: 1000, mimeType: 'application/pdf');
    const b = CmPickedFile(name: 'b.pdf', size: 1000, mimeType: 'application/pdf');
    key.currentState!.addFiles(const [a, b]);
    await t.pump();
    key.currentState!.setProgress(a, 40);
    await t.pump();
    final bar = t.getSemantics(find.bySemanticsLabel('Uploading a.pdf')).getSemanticsData();
    expect(bar.value, '40%');
    expect(key.currentState!.isUploading(a), isTrue);
    expect(find.bySemanticsLabel('Cancel uploading a.pdf'), findsOneWidget);
    expect(find.bySemanticsLabel('Remove a.pdf'), findsNothing);

    key.currentState!.setFileError(b, 'Upload failed. Try again.');
    await t.pump();
    expect(find.text('Upload failed. Try again.'), findsOneWidget);
    expect(t.takeAnnouncements().map((x) => x.message), contains('Upload failed. Try again.'));

    await t.tap(find.bySemanticsLabel('Cancel uploading a.pdf'));
    await t.pump();
    expect(cancelled, ['a.pdf']);
    expect(files.map((f) => f.name), ['b.pdf']);
    key.currentState!.setFileError(b, '');
    await t.pump();
    expect(find.text('Upload failed. Try again.'), findsNothing);
    handle.dispose();
  });

  test('file size and accept helpers match the web component', () {
    expect(cmFileSize(300 * 1024), '300 KB');
    expect(cmFileSize(1536 * 1024), '1.5 MB');
    expect(cmFileSize(10), '1 KB');
    expect(cmFileAccepted(const CmPickedFile(name: 'x.CSV', size: 1), ['.csv']), isTrue);
    expect(cmFileAccepted(const CmPickedFile(name: 'photo.webp', size: 1), ['image/*']), isTrue);
    expect(cmFileAccepted(const CmPickedFile(name: 'doc.pdf', size: 1, mimeType: 'application/pdf'), ['image/*']), isFalse);
  });
}
