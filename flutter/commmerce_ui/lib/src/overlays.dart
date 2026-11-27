import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';

import 'button.dart';
import 'display.dart';
import 'forms.dart';
import 'generated/icons.g.dart';
import 'generated/tokens.g.dart';
import 'icon.dart';
import 'shortcut.dart';
import 'strings.dart';
import 'theme.dart';

// Overlays mirror the web batch in packages/ui/src/overlay.ts and components/{modal,side-panel,filter-panel,
// action-menu,bottom-sheet,notification-panel}.ts. The modal ones open as Navigator routes (showGeneralDialog):
// the page behind is dimmed with the `overlay` token and hidden from screen readers by the route's barrier,
// focus moves into the overlay and Tab stays inside it, Esc and a tap on the dim close it unless it is not
// dismissible, and focus goes back to the widget that had it when the overlay opened.

/// Widths of [CmModal] (400, 620, 900) and [CmSidePanel] (380, 450, 720).
enum CmOverlaySize { small, medium, large }

/// Which edge of its trigger a [CmActionMenu] lines up with.
enum CmMenuAlign { start, end }

const _modalWidths = {CmOverlaySize.small: 400.0, CmOverlaySize.medium: 620.0, CmOverlaySize.large: 900.0};
const _sideWidths = {CmOverlaySize.small: 380.0, CmOverlaySize.medium: 450.0, CmOverlaySize.large: 720.0};

/// One choice in a [CmActionMenu] or [CmBottomSheet]. [CmMenuItem.divider] draws a line between groups.
@immutable
class CmMenuItem {
  const CmMenuItem({required this.label, this.value, this.icon, this.disabled = false, this.critical = false, this.onPressed, this.shortcut})
      : divider = false,
        heading = false;

  /// A separator line between groups of choices.
  const CmMenuItem.divider()
      : label = '',
        value = null,
        icon = null,
        disabled = true,
        critical = false,
        onPressed = null,
        shortcut = null,
        divider = true,
        heading = false;

  /// A section heading (12px grey text) over the choices after it, up to the next heading or divider. Never a choice:
  /// the keyboard skips it and screen readers hear it as a heading. Since 1.7 (web 1.6 `cm-menu-item heading`).
  const CmMenuItem.heading(this.label)
      : value = null,
        icon = null,
        disabled = true,
        critical = false,
        onPressed = null,
        shortcut = null,
        divider = false,
        heading = true;

  /// Visible text, verb first: "Cancel shipment".
  final String label;

  /// Identifies the choice. Defaults to [label]; see [id].
  final String? value;

  /// Icon from [CmIcons], before the label.
  final String? icon;

  /// Can't be chosen right now.
  final bool disabled;

  /// A destructive choice, e.g. "Cancel order". Shown in the critical colour.
  final bool critical;

  /// Called when this choice is made, before the menu's own `onSelected`.
  final VoidCallback? onPressed;

  /// True for [CmMenuItem.divider].
  final bool divider;

  /// True for [CmMenuItem.heading].
  final bool heading;

  /// A keyboard shortcut shown at the end of the row in 12px grey, e.g. "Ctrl+E" (or written as for [CmShortcut]:
  /// `mod+e` shows ⌘E on a Mac and Ctrl+E elsewhere). Screen readers hear it after the label. Only shown: your app
  /// listens for the shortcut itself. Since 1.7.
  final String? shortcut;

  /// [value], or the [label] when there is no value.
  String get id => value ?? label;
}

/// One notification in a [CmNotificationPanel].
@immutable
class CmNotification {
  const CmNotification({required this.label, this.time, this.tone = CmTone.information, this.unread = false, this.value, this.description, this.icon});

  /// What happened: "New order received".
  final String label;

  /// When, as shown: "1 min ago".
  final String? time;

  /// Colour and icon: information (default, a bag), attention, success or critical. Neutral shows as information.
  final CmTone tone;

  /// Not read yet: the label is bold and "Unread:" is read out first.
  final bool unread;

  /// Identifies it. Defaults to [label]; see [id].
  final String? value;

  /// A second line under the label, in smaller grey text: "Follow-up due at 4 pm". Since 1.1.
  final String? description;

  /// Icon name from [CmIcons] for the kind ("user", "clock"), shown in the tone's colours instead of the tone's
  /// own icon. Since 1.1.
  final String? icon;

  /// A copy marked read (or unread).
  CmNotification copyWith({bool? unread}) =>
      CmNotification(label: label, time: time, tone: tone, unread: unread ?? this.unread, value: value, description: description, icon: icon);

  /// [value], or the [label] when there is no value.
  String get id => value ?? label;
}

// ---------------------------------------------------------------------------------------------------------
// Shared parts

/// A focusable, pressable box: Enter and Space press it, and [builder] gets hover and keyboard-focus state.
class _Pressable extends StatefulWidget {
  const _Pressable({required this.onTap, required this.builder, this.label, this.focusNode, this.onHover});
  final VoidCallback? onTap;
  final Widget Function(BuildContext context, bool hover, bool focus) builder;

  /// Accessible name. When set, the children's own semantics are replaced by it.
  final String? label;
  final FocusNode? focusNode;
  final ValueChanged<bool>? onHover;

  @override
  State<_Pressable> createState() => _PressableState();
}

class _PressableState extends State<_Pressable> {
  bool _hover = false, _focus = false;

  @override
  Widget build(BuildContext context) {
    final enabled = widget.onTap != null;
    return Semantics(
      button: true,
      enabled: enabled,
      label: widget.label,
      excludeSemantics: widget.label != null,
      onTap: widget.onTap, // keep the action when child semantics are excluded
      child: FocusableActionDetector(
        focusNode: widget.focusNode,
        enabled: enabled,
        mouseCursor: enabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
        onShowHoverHighlight: (v) {
          setState(() => _hover = v);
          widget.onHover?.call(v);
        },
        onShowFocusHighlight: (v) => setState(() => _focus = v),
        actions: {ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) { widget.onTap?.call(); return null; })},
        child: GestureDetector(behavior: HitTestBehavior.opaque, onTap: widget.onTap, child: widget.builder(context, _hover && enabled, _focus)),
      ),
    );
  }
}

/// The close button: 28px square in a black header, or a 36px black circle on a bottom sheet.
class _CloseButton extends StatelessWidget {
  const _CloseButton({required this.label, required this.onTap, this.round = false});
  final String label;
  final VoidCallback onTap;
  final bool round;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final size = round ? 36.0 : 28.0;
    return _Pressable(
      label: label,
      onTap: onTap,
      builder: (context, hover, focus) => Container(
        width: size,
        height: size,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: round ? c.bgPanelHeader : null,
          shape: round ? BoxShape.circle : BoxShape.rectangle,
          borderRadius: round ? null : BorderRadius.circular(CmRadius.sm),
          border: focus && !round ? Border.all(color: c.textOnDark, width: 2) : null,
          boxShadow: focus && round ? [BoxShadow(color: c.bgSurface, spreadRadius: 2), BoxShadow(color: c.borderStrong, spreadRadius: 4)] : null,
        ),
        child: CmIcon(CmIcons.close, size: round ? 16 : 18, color: c.textOnDark),
      ),
    );
  }
}

/// Names the overlay for screen readers (a dialog that scopes and names its route), moves focus into it on
/// opening, and closes it on Esc when [onEscape] is set.
class _OverlayScope extends StatelessWidget {
  const _OverlayScope({required this.label, required this.onEscape, required this.child});
  final String label;
  final VoidCallback? onEscape;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    // The shortcut sits above the scope: with nothing inside focused yet, key events start at the scope itself.
    Widget w = FocusScope(autofocus: true, child: child);
    if (onEscape != null) w = CallbackShortcuts(bindings: {const SingleActivator(LogicalKeyboardKey.escape): onEscape!}, child: w);
    return Semantics(role: SemanticsRole.dialog, container: true, scopesRoute: true, namesRoute: true, explicitChildNodes: true, label: label, child: w);
  }
}

TextStyle _bodyStyle(CmColors c) => CmType.bodyMd.copyWith(height: 20 / 14, color: c.textDefault);

/// The footer bar: a top border and the actions 10px apart.
Widget _footerBar(BuildContext context, List<Widget> children, {WrapAlignment alignment = WrapAlignment.end}) {
  final c = CmTheme.colorsOf(context);
  return DecoratedBox(
    decoration: BoxDecoration(border: Border(top: BorderSide(color: c.borderSubtle))),
    child: Padding(
      padding: const EdgeInsets.symmetric(horizontal: CmSpace.s20, vertical: CmSpace.s16),
      child: Wrap(alignment: alignment, crossAxisAlignment: WrapCrossAlignment.center, spacing: CmSpace.s8, runSpacing: CmSpace.s8, children: children),
    ),
  );
}

/// White panel with the black header (title and close button), a body and an optional footer.
class _Panel extends StatelessWidget {
  const _Panel({
    required this.title,
    required this.body,
    this.footer,
    this.onClose,
    this.closeLabel = 'Close',
    this.radius = CmRadius.sm,
    this.expand = false,
    this.headerExtra,
    this.scroll = true,
  });
  final String title;
  final Widget body;
  final Widget? footer;
  final VoidCallback? onClose;
  final String closeLabel;
  final double radius;
  final bool expand;
  final Widget? headerExtra;

  /// Wraps [body] in a scroll view with 20px padding. Off when the body scrolls itself.
  final bool scroll;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final head = Container(
      constraints: const BoxConstraints(minHeight: 40),
      padding: const EdgeInsets.fromLTRB(CmSpace.s16, 8, CmSpace.s8, 8),
      color: c.bgPanelHeader,
      child: Row(children: [
        Expanded(child: Semantics(header: true, child: Text(title, style: CmType.bodyMd.copyWith(height: 20 / 14, fontWeight: FontWeight.w500, color: c.textOnDark)))),
        if (headerExtra != null) ...[const SizedBox(width: CmSpace.s8), headerExtra!],
        if (onClose != null) ...[const SizedBox(width: CmSpace.s8), _CloseButton(label: closeLabel, onTap: onClose!)],
      ]),
    );
    Widget content = DefaultTextStyle(style: _bodyStyle(c), child: body);
    if (scroll) content = SingleChildScrollView(padding: const EdgeInsets.all(CmSpace.s20), child: content);
    return Material(
      type: MaterialType.transparency,
      child: Container(
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(color: c.bgSurface, borderRadius: BorderRadius.circular(radius), boxShadow: CmShadow.lg),
        child: Column(mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          head,
          if (expand) Expanded(child: content) else Flexible(child: content),
          if (footer != null) footer!,
        ]),
      ),
    );
  }
}

/// Places a side panel: full height on the end edge, or a card inset 16px from the screen edges on phones.
Widget _sidePanelLayout(BuildContext context, CmOverlaySize size, Widget Function(double radius) panel) {
  final phone = CmBreakpoints.of(context) == CmScreen.phone;
  if (phone) return SafeArea(child: Padding(padding: const EdgeInsets.all(16), child: panel(CmRadius.lg)));
  final w = MediaQuery.sizeOf(context).width;
  return Align(alignment: AlignmentDirectional.centerEnd, child: SizedBox(width: math.min(_sideWidths[size]!, w), height: double.infinity, child: panel(0)));
}

VoidCallback _popper(BuildContext context, VoidCallback? onClose) => onClose ?? () { Navigator.maybePop(context); };

enum _Kind { modal, side, sheet, notifications }

Widget _transition(BuildContext context, _Kind kind, Animation<double> a, Widget child) {
  if (MediaQuery.disableAnimationsOf(context)) return child;
  final curved = CurvedAnimation(parent: a, curve: CmMotion.standard);
  final from = switch (kind) { _Kind.side => const Offset(24, 0), _Kind.sheet => const Offset(0, 24), _ => Offset.zero };
  return FadeTransition(
    opacity: curved,
    child: from == Offset.zero
        ? child
        : AnimatedBuilder(animation: curved, builder: (_, c) => Transform.translate(offset: from * (1 - curved.value), child: c), child: child),
  );
}

Future<T?> _showCmOverlay<T>(
  BuildContext context, {
  required _Kind kind,
  required bool dismissible,
  required String closeLabel,
  required bool useRootNavigator,
  required WidgetBuilder builder,
}) async {
  final opener = FocusManager.instance.primaryFocus;
  final navigator = Navigator.of(context, rootNavigator: useRootNavigator);
  final themes = InheritedTheme.capture(from: context, to: navigator.context);
  final c = CmTheme.colorsOf(context);
  final result = await showGeneralDialog<T>(
    context: context,
    useRootNavigator: useRootNavigator,
    barrierDismissible: dismissible,
    barrierLabel: MaterialLocalizations.of(context).modalBarrierDismissLabel,
    barrierColor: c.overlay,
    transitionDuration: cmDuration(context),
    pageBuilder: (ctx, _, __) => themes.wrap(PopScope(canPop: dismissible, child: Builder(builder: builder))),
    transitionBuilder: (ctx, a, _, child) => _transition(ctx, kind, a, child),
  );
  // The page's focus scope restores its last focus by itself; this also covers openers in nested scopes.
  if (opener != null && (opener.context?.mounted ?? false) && opener.canRequestFocus) opener.requestFocus();
  return result;
}

// ---------------------------------------------------------------------------------------------------------
// Modal

/// A dialog over the page for a short task or a decision that must be made before going on: a black header
/// with the title and a close button, the content with 20px padding, and the [actions] right-aligned in a
/// footer (the main action last). Mirrors `<cm-modal>`. Open it with [showCmModal].
///
/// Three widths ([CmOverlaySize]: 400, 620, 900), never wider than the screen less 16px each side, and at
/// most the screen height less 64px (the content scrolls).
class CmModal extends StatelessWidget {
  const CmModal({
    super.key,
    required this.title,
    required this.child,
    this.actions = const [],
    this.size = CmOverlaySize.medium,
    this.dismissible = true,
    this.closeLabel = 'Close',
    this.onClose,
  });

  /// A question or a task: "Cancel order #1042?". Also the dialog's accessible name.
  final String title;
  final Widget child;

  /// Footer buttons, usually [CmButton]s: Cancel first, the main action last. Empty hides the footer.
  final List<Widget> actions;
  final CmOverlaySize size;

  /// False hides the close button and ignores Esc, the dim and the back button: an action must be chosen.
  final bool dismissible;

  /// Accessible name of the close button.
  final String closeLabel;

  /// Called by the close button and Esc. Defaults to closing the route.
  final VoidCallback? onClose;

  @override
  Widget build(BuildContext context) {
    final screen = MediaQuery.sizeOf(context);
    final close = _popper(context, onClose);
    return _OverlayScope(
      label: title,
      onEscape: dismissible ? close : null,
      child: Center(
        child: SizedBox(
          width: math.max(0, math.min(_modalWidths[size]!, screen.width - 32)),
          child: ConstrainedBox(
            constraints: BoxConstraints(maxHeight: math.max(0, screen.height - 64)),
            child: _Panel(
              title: title,
              closeLabel: closeLabel,
              onClose: dismissible ? close : null,
              body: child,
              footer: actions.isEmpty ? null : _footerBar(context, actions),
              radius: CmRadius.lg,
            ),
          ),
        ),
      ),
    );
  }
}

/// Opens a [CmModal] and completes with the value it is closed with (`Navigator.pop(context, value)` from
/// an action), or null when it is dismissed. [builder] and [actions] get the modal's own context.
Future<T?> showCmModal<T>({
  required BuildContext context,
  required String title,
  required WidgetBuilder builder,
  List<Widget> Function(BuildContext context)? actions,
  CmOverlaySize size = CmOverlaySize.medium,
  bool dismissible = true,
  String closeLabel = 'Close',
  bool useRootNavigator = true,
}) =>
    _showCmOverlay<T>(
      context,
      kind: _Kind.modal,
      dismissible: dismissible,
      closeLabel: closeLabel,
      useRootNavigator: useRootNavigator,
      builder: (ctx) => CmModal(title: title, size: size, dismissible: dismissible, closeLabel: closeLabel, actions: actions?.call(ctx) ?? const [], child: builder(ctx)),
    );

// ---------------------------------------------------------------------------------------------------------
// Side panel

/// A panel over the end edge of the page with the details of one item (an enquiry, an order, a customer)
/// without leaving the list: a black header with the title and a close button, the content, and optional
/// [actions] in a footer. Full height on tablets and desktops (380, 450 or 720px wide); on phones a card
/// inset 16px from the screen edges. Mirrors `<cm-side-panel>`. Open it with [showCmSidePanel].
class CmSidePanel extends StatelessWidget {
  const CmSidePanel({
    super.key,
    required this.title,
    required this.child,
    this.actions = const [],
    this.size = CmOverlaySize.medium,
    this.dismissible = true,
    this.closeLabel = 'Close',
    this.onClose,
  });

  /// What the item is: "Order #1042". Also the dialog's accessible name.
  final String title;
  final Widget child;

  /// Footer buttons, right-aligned. Empty hides the footer.
  final List<Widget> actions;
  final CmOverlaySize size;

  /// False hides the close button and ignores Esc, the dim and the back button.
  final bool dismissible;
  final String closeLabel;

  /// Called by the close button and Esc. Defaults to closing the route.
  final VoidCallback? onClose;

  @override
  Widget build(BuildContext context) {
    final close = _popper(context, onClose);
    return _OverlayScope(
      label: title,
      onEscape: dismissible ? close : null,
      child: _sidePanelLayout(
        context,
        size,
        (radius) => _Panel(
          title: title,
          radius: radius,
          expand: true,
          closeLabel: closeLabel,
          onClose: dismissible ? close : null,
          body: child,
          footer: actions.isEmpty ? null : _footerBar(context, actions),
        ),
      ),
    );
  }
}

/// Opens a [CmSidePanel] and completes with the value it is closed with, or null when it is dismissed.
Future<T?> showCmSidePanel<T>({
  required BuildContext context,
  required String title,
  required WidgetBuilder builder,
  List<Widget> Function(BuildContext context)? actions,
  CmOverlaySize size = CmOverlaySize.medium,
  bool dismissible = true,
  String closeLabel = 'Close',
  bool useRootNavigator = true,
}) =>
    _showCmOverlay<T>(
      context,
      kind: _Kind.side,
      dismissible: dismissible,
      closeLabel: closeLabel,
      useRootNavigator: useRootNavigator,
      builder: (ctx) => CmSidePanel(title: title, size: size, dismissible: dismissible, closeLabel: closeLabel, actions: actions?.call(ctx) ?? const [], child: builder(ctx)),
    );

// ---------------------------------------------------------------------------------------------------------
// Filter panel

/// Builds the filter fields of a [CmFilterPanel]. Call [setState] when a field changes so the panel redraws.
typedef CmFilterFieldsBuilder = List<Widget> Function(BuildContext context, StateSetter setState);

/// "Search and Filter": a side panel with an optional search field, the fields that narrow a list (15px
/// apart), and Reset and Search centred at the bottom. Search (or Enter in the search field) calls
/// [onApply] and closes the panel with the search text; Reset calls [onReset], clears the search and redraws
/// the fields. Mirrors `<cm-filter-panel>`. Open it with [showCmFilterPanel], usually from [CmSearch.onFilter].
class CmFilterPanel extends StatefulWidget {
  const CmFilterPanel({
    super.key,
    required this.fields,
    this.title = 'Search and Filter',
    this.search = false,
    this.initialQuery = '',
    this.searchLabel = 'Search',
    this.searchPlaceholder = 'Search anything',
    this.applyLabel = 'Search',
    this.resetLabel = 'Reset',
    this.appliedCount = 0,
    this.onApply,
    this.onReset,
    this.size = CmOverlaySize.medium,
    this.closeLabel = 'Close',
    this.onClose,
  });

  final CmFilterFieldsBuilder fields;
  final String title;

  /// Shows a search field above the filters.
  final bool search;
  final String initialQuery;
  final String searchLabel, searchPlaceholder;

  /// Text of the main button (Figma: "Search").
  final String applyLabel;
  final String resetLabel;

  /// Filters applied right now. Above 0 it shows as "2 applied" in the header and in the panel's name.
  final int appliedCount;

  /// Called with the search text when Search is pressed. Return false to keep the panel open (e.g. an
  /// invalid date range); anything else closes it.
  final bool Function(String query)? onApply;

  /// Called when Reset is pressed: put your filter values back to their first values.
  final VoidCallback? onReset;
  final CmOverlaySize size;
  final String closeLabel;

  /// Called by the close button and Esc. Defaults to closing the route.
  final VoidCallback? onClose;

  @override
  State<CmFilterPanel> createState() => _CmFilterPanelState();
}

class _CmFilterPanelState extends State<CmFilterPanel> {
  late final _query = TextEditingController(text: widget.initialQuery);

  @override
  void dispose() {
    _query.dispose();
    super.dispose();
  }

  void _apply() {
    if (widget.onApply?.call(_query.text) == false) return;
    Navigator.pop(context, _query.text);
  }

  void _reset() {
    _query.clear();
    widget.onReset?.call();
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final close = _popper(context, widget.onClose);
    final fields = widget.fields(context, setState);
    final n = widget.appliedCount;
    return _OverlayScope(
      label: n > 0 ? CmStrings.of(context).withApplied(widget.title, n) : widget.title,
      onEscape: close,
      child: _sidePanelLayout(
        context,
        widget.size,
        (radius) => _Panel(
          title: widget.title,
          radius: radius,
          expand: true,
          closeLabel: widget.closeLabel,
          onClose: close,
          headerExtra: n > 0 ? Text(CmStrings.of(context).applied(n), style: CmType.bodySm.copyWith(color: c.textOnDarkSecondary)) : null,
          body: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            if (widget.search) ...[
              CmSearch(label: widget.searchLabel, placeholder: widget.searchPlaceholder, controller: _query, onSubmitted: (_) => _apply()),
              const SizedBox(height: CmSpace.s20),
            ],
            for (var i = 0; i < fields.length; i++) ...[if (i > 0) const SizedBox(height: CmSpace.s16), fields[i]],
          ]),
          footer: _footerBar(context, alignment: WrapAlignment.center, [
            CmButton(label: widget.resetLabel, onPressed: _reset),
            CmButton(label: widget.applyLabel, variant: CmButtonVariant.primary, onPressed: _apply),
          ]),
        ),
      ),
    );
  }
}

/// Opens a [CmFilterPanel]. Completes with the search text ('' without a search field) when Search was
/// pressed, or null when the panel was closed without applying.
Future<String?> showCmFilterPanel({
  required BuildContext context,
  required CmFilterFieldsBuilder fields,
  String title = 'Search and Filter',
  bool search = false,
  String initialQuery = '',
  String searchLabel = 'Search',
  String searchPlaceholder = 'Search anything',
  String applyLabel = 'Search',
  String resetLabel = 'Reset',
  int appliedCount = 0,
  bool Function(String query)? onApply,
  VoidCallback? onReset,
  CmOverlaySize size = CmOverlaySize.medium,
  String closeLabel = 'Close',
  bool useRootNavigator = true,
}) =>
    _showCmOverlay<String>(
      context,
      kind: _Kind.side,
      dismissible: true,
      closeLabel: closeLabel,
      useRootNavigator: useRootNavigator,
      builder: (_) => CmFilterPanel(
        fields: fields,
        title: title,
        search: search,
        initialQuery: initialQuery,
        searchLabel: searchLabel,
        searchPlaceholder: searchPlaceholder,
        applyLabel: applyLabel,
        resetLabel: resetLabel,
        appliedCount: appliedCount,
        onApply: onApply,
        onReset: onReset,
        size: size,
        closeLabel: closeLabel,
      ),
    );

// ---------------------------------------------------------------------------------------------------------
// Bottom sheet

/// A sheet that rises from the bottom of a phone screen with a few actions ("Mark as paid order") or
/// shortcuts ("Orders"): white with 20px top corners, a round black close button on its top edge, and 44px
/// rows split by thin lines. Rows without icons are centred; rows with icons line up at the start and end in
/// a chevron. At most 600px wide on larger screens. Mirrors `<cm-bottom-sheet>`. Open it with
/// [showCmBottomSheet]. With the on-screen keyboard open, the sheet sits above it and its content scrolls
/// when it does not fit.
class CmBottomSheet extends StatelessWidget {
  const CmBottomSheet({super.key, required this.heading, this.items = const [], this.onSelected, this.child, this.closeLabel = 'Close', this.onClose});

  /// Names the sheet for screen readers ("Order actions"). Not shown.
  final String heading;

  /// Rows. Dividers are ignored: rows are always split by lines.
  final List<CmMenuItem> items;

  /// Called when a row is chosen, after its own [CmMenuItem.onPressed]. The sheet then closes with the row's id.
  final ValueChanged<CmMenuItem>? onSelected;

  /// Your own content, under the rows.
  final Widget? child;
  final String closeLabel;

  /// Called by the close button and Esc. Defaults to closing the route.
  final VoidCallback? onClose;

  void _choose(BuildContext context, CmMenuItem it) {
    it.onPressed?.call();
    onSelected?.call(it);
    Navigator.pop(context, it.id);
  }

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final screen = MediaQuery.sizeOf(context);
    // The on-screen keyboard: the sheet rises above it, and the safe-area inset it covers no longer applies.
    final keyboard = MediaQuery.viewInsetsOf(context).bottom;
    final close = _popper(context, onClose);
    final rows = items.where((it) => !it.divider && !it.heading).toList();
    final icons = rows.any((it) => it.icon != null);
    final panel = Container(
      constraints: BoxConstraints(maxHeight: math.max(0, screen.height - keyboard - 80)),
      padding: EdgeInsets.fromLTRB(CmSpace.s20, CmSpace.s20, CmSpace.s20, math.max(CmSpace.s20, keyboard > 0 ? 0 : MediaQuery.paddingOf(context).bottom)),
      decoration: BoxDecoration(color: c.bgSurface, borderRadius: const BorderRadius.vertical(top: Radius.circular(CmRadius.lg)), boxShadow: CmShadow.lg),
      child: Material(
        type: MaterialType.transparency,
        child: DefaultTextStyle(
          style: _bodyStyle(c),
          child: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              for (var i = 0; i < rows.length; i++)
                DecoratedBox(
                  decoration: BoxDecoration(border: i == 0 ? null : Border(top: BorderSide(color: c.borderSubtle))),
                  child: _SheetRow(item: rows[i], icons: icons, onTap: rows[i].disabled ? null : () => _choose(context, rows[i])),
                ),
              if (child != null) child!,
            ]),
          ),
        ),
      ),
    );
    return _OverlayScope(
      label: heading,
      onEscape: close,
      child: Padding(
        padding: EdgeInsets.only(bottom: keyboard),
        child: Align(
          alignment: Alignment.bottomCenter,
          child: SizedBox(
            width: math.min(600, screen.width),
            child: Padding(
              padding: const EdgeInsets.only(top: 4),
              // The close button straddles the top edge; the Stack includes its upper half so it can be tapped.
              child: Stack(clipBehavior: Clip.none, children: [
                Padding(padding: const EdgeInsets.only(top: CmSpace.s20), child: panel),
                Positioned(top: 0, left: 0, right: 0, child: Center(child: _CloseButton(label: closeLabel, onTap: close, round: true))),
              ]),
            ),
          ),
        ),
      ),
    );
  }
}

class _SheetRow extends StatelessWidget {
  const _SheetRow({required this.item, required this.icons, required this.onTap});
  final CmMenuItem item;
  final bool icons;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final fg = item.disabled ? c.textSecondary : item.critical ? c.textCritical : c.textDefault;
    return _Pressable(
      label: item.label,
      onTap: onTap,
      builder: (context, hover, focus) => Container(
        constraints: const BoxConstraints(minHeight: 44),
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
        decoration: BoxDecoration(
          color: hover && !item.critical ? c.bgHover : null,
          borderRadius: BorderRadius.circular(CmRadius.sm),
          border: focus ? Border.all(color: c.borderStrong, width: 2) : null,
        ),
        child: Row(mainAxisAlignment: icons ? MainAxisAlignment.start : MainAxisAlignment.center, children: [
          if (item.icon != null) ...[CmIcon(item.icon!, size: 18, color: c.iconDefault), const SizedBox(width: CmSpace.s8)],
          Flexible(
            fit: icons ? FlexFit.tight : FlexFit.loose,
            child: Text(
              item.label,
              textAlign: icons ? TextAlign.start : TextAlign.center,
              // Critical rows underline on hover: text-critical on bg-hover is under 4.5:1 in dark.
              style: CmType.bodyMd.copyWith(height: 20 / 14, color: fg, decoration: hover && item.critical ? TextDecoration.underline : null, decorationColor: fg),
            ),
          ),
          if (item.icon != null) ...[const SizedBox(width: CmSpace.s8), CmIcon(CmIcons.chevronRight, size: 16, color: fg)],
        ]),
      ),
    );
  }
}

/// Opens a [CmBottomSheet]. Completes with the chosen row's [CmMenuItem.id], or null when it is dismissed.
Future<String?> showCmBottomSheet({
  required BuildContext context,
  required String heading,
  List<CmMenuItem> items = const [],
  ValueChanged<CmMenuItem>? onSelected,
  WidgetBuilder? builder,
  String closeLabel = 'Close',
  bool useRootNavigator = true,
}) =>
    _showCmOverlay<String>(
      context,
      kind: _Kind.sheet,
      dismissible: true,
      closeLabel: closeLabel,
      useRootNavigator: useRootNavigator,
      builder: (ctx) => CmBottomSheet(heading: heading, items: items, onSelected: onSelected, closeLabel: closeLabel, child: builder?.call(ctx)),
    );

// ---------------------------------------------------------------------------------------------------------
// Notification panel

/// Recent notifications, opened from the bell in [CmHeaderBar]: a 380px panel under the top-right corner of
/// the page (on phones, the screen width less 8px each side) with a black "Notifications" header, one 40px
/// row per notification (alternately white and light grey: a coloured icon for its kind, what happened, and
/// when), and "See more notifications" at the bottom. Mirrors `<cm-notification-panel>`. Open it with
/// [showCmNotificationPanel]. For Commmerce products only, not for apps.
class CmNotificationPanel extends StatefulWidget {
  const CmNotificationPanel({
    super.key,
    required this.notifications,
    this.onSelected,
    this.onMore,
    this.heading = 'Notifications',
    this.moreLabel = 'See more notifications',
    this.emptyText = 'No notifications yet.',
    this.closeLabel = 'Close',
    this.onClose,
    this.top,
    this.onMarkAllRead,
    this.markAllLabel,
    this.loading = false,
    this.footer,
  });

  /// Newest first, about ten at most.
  final List<CmNotification> notifications;

  /// Shows a "Mark all read" button in the header while at least one notification is unread. Clear `unread` on
  /// your notifications in response; the panel also shows them read at once. Since 1.1.
  final VoidCallback? onMarkAllRead;

  /// Text of that button. Default: [CmStrings.markAllRead].
  final String? markAllLabel;

  /// Shows placeholder rows while you fetch the notifications, and announces "Loading" politely. Since 1.1.
  final bool loading;

  /// A control under the list, such as a toggle for push notifications on this device. Since 1.1.
  final Widget? footer;

  /// Called when a notification is chosen. The panel then closes with it.
  final ValueChanged<CmNotification>? onSelected;

  /// Opens the full list. Null hides "See more notifications".
  final VoidCallback? onMore;
  final String heading, moreLabel, emptyText, closeLabel;

  /// Called by the close button and Esc. Defaults to closing the route.
  final VoidCallback? onClose;

  /// Distance from the top of the screen. Defaults to 64 (56 on phones), under the header bar.
  final double? top;

  static const _icons = {CmTone.information: CmIcons.bag, CmTone.attention: CmIcons.alert, CmTone.success: CmIcons.checkCircle, CmTone.critical: CmIcons.xCircle};

  @override
  State<CmNotificationPanel> createState() => _CmNotificationPanelState();

  Widget _build(BuildContext context, bool allRead, VoidCallback markAll) {
    final c = CmTheme.colorsOf(context);
    final phone = CmBreakpoints.of(context) == CmScreen.phone;
    final screen = MediaQuery.sizeOf(context);
    final close = _popper(context, onClose);
    final y = top ?? (phone ? 56.0 : 64.0);
    final notifications = allRead ? [for (final n in this.notifications) n.copyWith(unread: false)] : this.notifications;
    Widget row(int i) {
      final n = notifications[i];
      final tone = n.tone == CmTone.neutral ? CmTone.information : n.tone;
      final (bg, fg) = switch (tone) {
        CmTone.attention => (c.bgAttention, c.textAttention),
        CmTone.success => (c.bgSuccessSoft, c.textSuccess),
        CmTone.critical => (c.bgCritical, c.textCritical),
        _ => (c.bgInformationSoft, c.textInformation),
      };
      final label = [if (n.unread) CmStrings.of(context).unread(n.label) else n.label, if (n.description != null) n.description!, if (n.time != null) n.time!].join(', ');
      final hasDesc = n.description != null && n.description!.isNotEmpty;
      return _Pressable(
        label: label,
        onTap: () {
          onSelected?.call(n);
          Navigator.pop(context, n);
        },
        builder: (context, hover, focus) => Container(
          constraints: const BoxConstraints(minHeight: 40),
          padding: const EdgeInsets.symmetric(horizontal: CmSpace.s16, vertical: 8),
          decoration: BoxDecoration(color: i.isOdd ? c.bgHover : c.bgSurface, border: focus ? Border.all(color: c.borderStrong, width: 2) : null),
          child: Row(crossAxisAlignment: hasDesc ? CrossAxisAlignment.start : CrossAxisAlignment.center, children: [
            Container(
              width: 24,
              height: 24,
              margin: EdgeInsets.only(top: hasDesc ? 1 : 0),
              alignment: Alignment.center,
              decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(CmRadius.xs)),
              child: CmIcon(n.icon ?? _icons[tone]!, size: 14, color: fg),
            ),
            const SizedBox(width: CmSpace.s8),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
                Text(n.label,
                    style: TextStyle(
                      fontFamily: cmFontFamily,
                      package: cmFontPackage,
                      fontSize: 13,
                      height: 18 / 13,
                      fontWeight: n.unread ? FontWeight.w600 : FontWeight.w400,
                      color: c.textDefault,
                      decoration: hover ? TextDecoration.underline : null,
                    )),
                if (hasDesc) Text(n.description!, style: TextStyle(fontFamily: cmFontFamily, package: cmFontPackage, fontSize: 12, height: 16 / 12, color: c.textTertiary)),
              ]),
            ),
            if (n.time != null) ...[
              const SizedBox(width: CmSpace.s8),
              Padding(padding: EdgeInsets.only(top: hasDesc ? 1 : 0), child: Text(n.time!, style: TextStyle(fontFamily: cmFontFamily, package: cmFontPackage, fontSize: 12, color: c.textTertiary))),
            ],
          ]),
        ),
      );
    }

    final list = loading
        ? ExcludeSemantics(
            child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              for (var i = 0; i < 3; i++)
                Container(
                  constraints: const BoxConstraints(minHeight: 40),
                  padding: const EdgeInsets.symmetric(horizontal: CmSpace.s16, vertical: 8),
                  color: i.isOdd ? c.bgHover : c.bgSurface,
                  child: const Row(children: [CmSkeleton(width: 24, height: 24), SizedBox(width: CmSpace.s8), Expanded(child: CmSkeleton())]),
                ),
            ]),
          )
        : notifications.isEmpty
        ? Padding(
            padding: const EdgeInsets.all(CmSpace.s20),
            child: Text(emptyText, textAlign: TextAlign.center, style: TextStyle(fontFamily: cmFontFamily, package: cmFontPackage, fontSize: 13, color: c.textTertiary)),
          )
        : SingleChildScrollView(child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [for (var i = 0; i < notifications.length; i++) row(i)]));
    final more = onMore == null
        ? null
        : DecoratedBox(
            decoration: BoxDecoration(border: Border(top: BorderSide(color: c.borderSubtle))),
            child: _Pressable(
              label: moreLabel,
              onTap: onMore,
              builder: (context, hover, focus) => Container(
                padding: const EdgeInsets.all(CmSpace.s8),
                alignment: Alignment.center,
                decoration: BoxDecoration(border: focus ? Border.all(color: c.borderStrong, width: 2) : null),
                child: Text(moreLabel, style: CmType.bodySm.copyWith(color: c.textDefault, decoration: hover ? TextDecoration.underline : null)),
              ),
            ),
          );
    final panel = ConstrainedBox(
      constraints: BoxConstraints(maxHeight: math.max(0, screen.height - y - 16)),
      child: _Panel(
        title: heading,
        closeLabel: closeLabel,
        onClose: close,
        scroll: false,
        headerExtra: onMarkAllRead != null && !loading && notifications.any((n) => n.unread)
            ? _MarkAllButton(label: markAllLabel ?? CmStrings.of(context).markAllRead, onTap: markAll)
            : null,
        body: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Flexible(child: list),
          Semantics(liveRegion: true, label: loading ? CmStrings.of(context).loading : null, child: const SizedBox.shrink()),
        ]),
        footer: more == null && footer == null
            ? null
            : Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                ?more,
                if (footer != null)
                  DecoratedBox(
                    decoration: BoxDecoration(border: Border(top: BorderSide(color: c.borderSubtle))),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: CmSpace.s16, vertical: CmSpace.s8),
                      child: DefaultTextStyle.merge(style: const TextStyle(fontSize: 13), child: footer!),
                    ),
                  ),
              ]),
      ),
    );
    return _OverlayScope(
      label: heading,
      onEscape: close,
      child: Stack(children: [
        if (phone)
          Positioned(top: y, left: 8, right: 8, child: panel)
        else
          PositionedDirectional(top: y, end: 20, width: math.min(380, screen.width - 32), child: panel),
      ]),
    );
  }
}

class _CmNotificationPanelState extends State<CmNotificationPanel> {
  /// Set by "Mark all read" until the app passes a new list.
  bool _allRead = false;

  @override
  void didUpdateWidget(CmNotificationPanel old) {
    super.didUpdateWidget(old);
    if (!identical(old.notifications, widget.notifications)) _allRead = false;
  }

  @override
  Widget build(BuildContext context) => widget._build(context, _allRead, () {
        setState(() => _allRead = true);
        widget.onMarkAllRead?.call();
      });
}

/// The notification panel header's "Mark all read": underlined 12px text on the black header.
class _MarkAllButton extends StatelessWidget {
  const _MarkAllButton({required this.label, required this.onTap});
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    return _Pressable(
      label: label,
      onTap: onTap,
      builder: (context, hover, focus) => Container(
        padding: const EdgeInsets.symmetric(horizontal: CmSpace.s8, vertical: CmSpace.s4),
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(CmRadius.sm), border: focus ? Border.all(color: c.textOnDark, width: 2) : null),
        child: Text(label,
            style: TextStyle(fontFamily: cmFontFamily, package: cmFontPackage, fontSize: 12, height: 16 / 12, color: c.textOnDark,
                decoration: TextDecoration.underline, decorationColor: c.textOnDark, decorationThickness: hover ? 2 : 1)),
      ),
    );
  }
}

/// Opens a [CmNotificationPanel]. Completes with the chosen notification, or null when it is dismissed.
Future<CmNotification?> showCmNotificationPanel({
  required BuildContext context,
  required List<CmNotification> notifications,
  ValueChanged<CmNotification>? onSelected,
  VoidCallback? onMore,
  String heading = 'Notifications',
  String moreLabel = 'See more notifications',
  String emptyText = 'No notifications yet.',
  String closeLabel = 'Close',
  double? top,
  bool useRootNavigator = true,
  VoidCallback? onMarkAllRead,
  String? markAllLabel,
  Widget? footer,
  Future<List<CmNotification>>? load,
}) =>
    _showCmOverlay<CmNotification>(
      context,
      kind: _Kind.notifications,
      dismissible: true,
      closeLabel: closeLabel,
      useRootNavigator: useRootNavigator,
      builder: (ctx) => FutureBuilder<List<CmNotification>>(
        future: load,
        builder: (ctx, snap) => CmNotificationPanel(
        notifications: load == null ? notifications : (snap.data ?? const []),
        loading: load != null && snap.connectionState != ConnectionState.done,
        onMarkAllRead: onMarkAllRead,
        markAllLabel: markAllLabel,
        footer: footer,
        onSelected: onSelected,
        onMore: onMore == null
            ? null
            : () {
                Navigator.pop(ctx);
                onMore();
              },
        heading: heading,
        moreLabel: moreLabel,
        emptyText: emptyText,
        closeLabel: closeLabel,
        top: top,
      ),
      ),
    );

// ---------------------------------------------------------------------------------------------------------
// Action menu

/// A button that opens a short list of actions: row actions on an order ("Cancel shipment"), "Add…" menus,
/// or the account menu with the merchant's name and email on top ([heading], [subheading]). The highlighted
/// choice is black with white text. Mirrors `<cm-action-menu>`.
///
/// Keyboard: ↓/↑ (or Enter/Space) on the trigger open it on the first/last choice; in the menu ↓/↑ (wrapping),
/// Home/End and typing the first letters move, Enter/Space choose, Esc closes and returns focus to the
/// trigger, Tab closes and moves on. Disabled choices are skipped. A tap outside closes it. Not modal: the
/// page is not dimmed.
class CmActionMenu extends StatefulWidget {
  const CmActionMenu({
    super.key,
    required this.items,
    this.onSelected,
    this.label = 'Actions',
    this.triggerLabel,
    this.iconOnly = false,
    this.align = CmMenuAlign.start,
    this.heading,
    this.subheading,
    this.triggerBuilder,
    this.density = CmDensity.comfortable,
  });

  /// Row height (owner standard, 1.6): comfortable 36 (the default) or compact 32; 44 on touch screens. Since 1.7.
  final CmDensity density;

  /// Choices, with [CmMenuItem.divider] between groups and [CmMenuItem.heading] over sections. About eight at most.
  final List<CmMenuItem> items;

  /// Called when a choice is made, after its own [CmMenuItem.onPressed].
  final ValueChanged<CmMenuItem>? onSelected;

  /// Accessible name of the menu, and of the trigger when it is icon-only: "Order #1042 actions".
  final String label;

  /// Text of the built-in trigger. Defaults to [label].
  final String? triggerLabel;

  /// The built-in trigger is a "more" (⋮) icon button, e.g. for table rows.
  final bool iconOnly;

  /// Use [CmMenuAlign.end] for triggers at the end edge of the page.
  final CmMenuAlign align;

  /// Bold line above the choices, e.g. the merchant's name in the account menu.
  final String? heading;

  /// Smaller line under the heading, e.g. the email.
  final String? subheading;

  /// Your own trigger. Call `toggle` from its onPressed; `open` tells whether the menu is showing.
  final Widget Function(BuildContext context, bool open, VoidCallback toggle)? triggerBuilder;

  @override
  State<CmActionMenu> createState() => CmActionMenuState();
}

/// State of a [CmActionMenu]: [show], [hide] and [isOpen] for opening it from code.
class CmActionMenuState extends State<CmActionMenu> {
  final _portal = OverlayPortalController();
  final _trigger = FocusNode(debugLabel: 'CmActionMenu trigger');
  final List<FocusNode> _nodes = [];
  final _group = Object();
  FocusNode? _opener;
  int _active = -1;
  String _typed = '';
  DateTime _typedAt = DateTime.fromMillisecondsSinceEpoch(0);

  /// Whether the menu is showing.
  bool get isOpen => _portal.isShowing;

  List<int> get _enabled => [for (var i = 0; i < widget.items.length; i++) if (!widget.items[i].divider && !widget.items[i].disabled) i];

  FocusNode _node(int i) {
    while (_nodes.length <= i) {
      _nodes.add(FocusNode(debugLabel: 'CmActionMenu item ${_nodes.length}'));
    }
    return _nodes[i];
  }

  @override
  void dispose() {
    _trigger.dispose();
    for (final n in _nodes) {
      n.dispose();
    }
    super.dispose();
  }

  /// Opens the menu and moves focus to the first (or, with `last`, the last) choice.
  void show({bool last = false}) {
    final en = _enabled;
    if (!isOpen) _opener = widget.triggerBuilder == null ? _trigger : FocusManager.instance.primaryFocus;
    setState(() => _active = en.isEmpty ? -1 : (last ? en.last : en.first));
    if (!isOpen) _portal.show();
    _focusActive();
  }

  /// Closes the menu. With `returnFocus`, focus goes back to the trigger.
  void hide({bool returnFocus = false}) {
    if (!isOpen) return;
    _portal.hide();
    setState(() => _active = -1);
    if (returnFocus) _opener?.requestFocus();
  }

  void _toggle() => isOpen ? hide(returnFocus: true) : show();

  void _focusActive() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && _active >= 0 && _active < _nodes.length) _nodes[_active].requestFocus();
    });
  }

  void _move(int to) {
    setState(() => _active = to);
    _focusActive();
  }

  void _choose(CmMenuItem it) {
    if (it.disabled) return;
    hide(returnFocus: true);
    it.onPressed?.call();
    widget.onSelected?.call(it);
  }

  KeyEventResult _triggerKey(FocusNode node, KeyEvent e) {
    if (e is KeyUpEvent) return KeyEventResult.ignored;
    final k = e.logicalKey;
    if (!isOpen && k == LogicalKeyboardKey.arrowDown) {
      show();
      return KeyEventResult.handled;
    }
    if (!isOpen && k == LogicalKeyboardKey.arrowUp) {
      show(last: true);
      return KeyEventResult.handled;
    }
    if (isOpen && k == LogicalKeyboardKey.escape) {
      hide(returnFocus: true);
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  KeyEventResult _menuKey(FocusNode node, KeyEvent e) {
    if (e is KeyUpEvent) return KeyEventResult.ignored;
    final en = _enabled;
    if (en.isEmpty) return KeyEventResult.ignored;
    final pos = en.indexOf(_active);
    final k = e.logicalKey;
    if (k == LogicalKeyboardKey.arrowDown) {
      _move(en[(pos + 1) % en.length]);
    } else if (k == LogicalKeyboardKey.arrowUp) {
      _move(en[(pos - 1 + en.length) % en.length]);
    } else if (k == LogicalKeyboardKey.home) {
      _move(en.first);
    } else if (k == LogicalKeyboardKey.end) {
      _move(en.last);
    } else if (k == LogicalKeyboardKey.escape) {
      hide(returnFocus: true);
    } else if (k == LogicalKeyboardKey.tab) {
      final back = HardwareKeyboard.instance.isShiftPressed;
      final opener = _opener;
      hide(returnFocus: true);
      if (!back) WidgetsBinding.instance.addPostFrameCallback((_) => opener?.nextFocus());
    } else {
      final ch = e.character;
      final hw = HardwareKeyboard.instance;
      if (ch == null || ch.length != 1 || ch.trim().isEmpty || hw.isControlPressed || hw.isMetaPressed || hw.isAltPressed) return KeyEventResult.ignored;
      final now = DateTime.now();
      _typed = (now.difference(_typedAt).inMilliseconds < 600 ? _typed : '') + ch.toLowerCase();
      _typedAt = now;
      final start = math.max(_typed.length > 1 ? pos : pos + 1, 0);
      final order = [...en.skip(start), ...en.take(start)];
      for (final i in order) {
        if (widget.items[i].label.toLowerCase().startsWith(_typed)) {
          _move(i);
          break;
        }
      }
    }
    return KeyEventResult.handled;
  }

  Widget _menu(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final items = widget.items;
    final apple = CmShortcut.isApple(Theme.of(context).platform);
    final rowH = cmIsTouch(context) ? CmControlHeight.touch : widget.density == CmDensity.compact ? CmControlHeight.sm : CmControlHeight.md;
    final children = <Widget>[];
    for (var i = 0; i < items.length; i++) {
      final it = items[i];
      if (it.divider) {
        children.add(Container(height: 1, margin: const EdgeInsets.symmetric(vertical: 4), color: c.borderSubtle));
        continue;
      }
      if (it.heading) {
        children.add(Semantics(
          header: true,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(CmSpace.s12, CmSpace.s8, CmSpace.s12, CmSpace.s4),
            child: Text(it.label, style: CmType.bodyXs.copyWith(fontWeight: FontWeight.w500, color: c.textTertiary)),
          ),
        ));
        continue;
      }
      final active = i == _active && !it.disabled;
      final fg = it.disabled ? c.textSecondary : it.critical ? c.textCritical : active ? c.textOnDark : c.textDefault;
      final keyFg = it.disabled ? c.textSecondary : it.critical ? c.textCritical : active ? c.textOnDarkSecondary : c.textTertiary;
      final bg = !active ? null : it.critical ? c.bgCritical : c.bgPanelHeader;
      final sc = it.shortcut;
      final keys = sc == null || sc.isEmpty ? null : (CmShortcut.activator(sc, apple: apple) != null ? CmShortcut.keys(sc, apple: apple).join(apple ? '' : '+') : sc);
      children.add(Semantics(
        role: SemanticsRole.menuItem,
        child: _Pressable(
          label: keys == null ? it.label : '${it.label}, ${CmShortcut.activator(sc!, apple: apple) != null ? CmShortcut.spoken(sc, apple: apple) : sc}',
          focusNode: _node(i),
          onTap: it.disabled ? null : () => _choose(it),
          onHover: (v) { if (v && !it.disabled) setState(() => _active = i); },
          builder: (context, hover, focus) => Container(
            constraints: BoxConstraints(minHeight: rowH),
            padding: const EdgeInsets.symmetric(horizontal: CmSpace.s12, vertical: CmSpace.s4),
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(CmRadius.sm),
              boxShadow: active && focus ? [BoxShadow(color: c.bgSurface, spreadRadius: 1), BoxShadow(color: c.borderStrong, spreadRadius: 3)] : null,
            ),
            child: Row(children: [
              if (it.icon != null) ...[CmIcon(it.icon!, size: 16, color: fg), const SizedBox(width: CmSpace.s8)],
              Expanded(child: Text(it.label, style: CmType.bodyMd.copyWith(height: 20 / 14, color: fg))),
              if (keys != null)
                Padding(
                  padding: const EdgeInsetsDirectional.only(start: CmSpace.s16),
                  child: Text(keys, style: CmType.bodyXs.copyWith(color: keyFg)),
                ),
            ]),
          ),
        ),
      ));
    }
    final heading = widget.heading;
    return TapRegion(
      groupId: _group,
      onTapOutside: (_) => hide(),
      child: Material(
        type: MaterialType.transparency,
        child: Container(
          constraints: const BoxConstraints(minWidth: 180),
          padding: const EdgeInsets.all(CmSpace.s4),
          decoration: BoxDecoration(
            color: c.bgSurface,
            border: Border.all(color: c.borderSubtle),
            borderRadius: BorderRadius.circular(CmRadius.md),
            boxShadow: CmShadow.md,
          ),
          child: IntrinsicWidth(
            child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              if (heading != null)
                Container(
                  padding: const EdgeInsets.fromLTRB(CmSpace.s12, CmSpace.s4, CmSpace.s12, CmSpace.s8),
                  margin: const EdgeInsets.only(bottom: 4),
                  decoration: BoxDecoration(border: Border(bottom: BorderSide(color: c.borderSubtle))),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(heading, style: CmType.bodyMd.copyWith(height: 20 / 14, fontWeight: FontWeight.w500, color: c.textDefault)),
                    if (widget.subheading != null) Text(widget.subheading!, style: TextStyle(fontFamily: cmFontFamily, package: cmFontPackage, fontSize: 12, color: c.textTertiary)),
                  ]),
                ),
              Focus(
                canRequestFocus: false,
                skipTraversal: true,
                onKeyEvent: _menuKey,
                child: Semantics(
                  role: SemanticsRole.menu,
                  container: true,
                  label: heading ?? widget.label,
                  explicitChildNodes: true,
                  child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: children),
                ),
              ),
            ]),
          ),
        ),
      ),
    );
  }

  Widget _builtInTrigger(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final name = widget.triggerLabel ?? widget.label;
    return Semantics(
      expanded: isOpen,
      child: _Pressable(
        label: widget.iconOnly ? widget.label : name,
        focusNode: _trigger,
        onTap: () {
          _trigger.requestFocus();
          _toggle();
        },
        builder: (context, hover, focus) => Container(
          height: 36,
          width: widget.iconOnly ? 36 : null,
          padding: widget.iconOnly ? null : const EdgeInsets.symmetric(horizontal: 12),
          alignment: widget.iconOnly ? Alignment.center : null,
          decoration: BoxDecoration(
            color: hover ? c.bgHover : widget.iconOnly ? null : c.bgSurface,
            border: widget.iconOnly ? null : Border.all(color: c.borderInput),
            borderRadius: BorderRadius.circular(CmRadius.sm),
            boxShadow: focus ? [BoxShadow(color: c.bgSurface, spreadRadius: 2), BoxShadow(color: c.borderStrong, spreadRadius: 4)] : null,
          ),
          child: widget.iconOnly
              ? CmIcon(CmIcons.more, size: 18, color: c.textDefault)
              : Row(mainAxisSize: MainAxisSize.min, children: [
                  Text(name, style: CmType.bodyMd.copyWith(height: 1, fontWeight: FontWeight.w500, color: c.textDefault)),
                  const SizedBox(width: CmSpace.s4),
                  CmIcon(CmIcons.chevronDown, size: 14, color: c.textDefault),
                ]),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final trigger = widget.triggerBuilder?.call(context, isOpen, _toggle) ?? _builtInTrigger(context);
    return OverlayPortal(
      controller: _portal,
      overlayChildBuilder: (context) {
        final box = this.context.findRenderObject() as RenderBox?;
        final overlay = Overlay.of(this.context).context.findRenderObject() as RenderBox?;
        if (box == null || overlay == null || !box.attached) return const SizedBox.shrink();
        final anchor = box.localToGlobal(Offset.zero, ancestor: overlay) & box.size;
        return CustomSingleChildLayout(
          delegate: _MenuLayout(anchor, widget.align == CmMenuAlign.end, Directionality.of(context)),
          child: _menu(context),
        );
      },
      child: Focus(
        canRequestFocus: false,
        skipTraversal: true,
        onKeyEvent: _triggerKey,
        child: TapRegion(groupId: _group, child: trigger),
      ),
    );
  }
}

/// Puts the menu 4px under its trigger (above it when there is no room below), kept 16px inside the screen.
class _MenuLayout extends SingleChildLayoutDelegate {
  _MenuLayout(this.anchor, this.end, this.direction);
  final Rect anchor;
  final bool end;
  final TextDirection direction;

  @override
  BoxConstraints getConstraintsForChild(BoxConstraints constraints) => BoxConstraints(
        maxWidth: math.max(0, math.min(320, constraints.maxWidth - 32)),
        maxHeight: math.max(0, constraints.maxHeight - 32),
      );

  @override
  Offset getPositionForChild(Size size, Size child) {
    final rightAligned = end == (direction == TextDirection.ltr);
    var x = rightAligned ? anchor.right - child.width : anchor.left;
    x = x.clamp(16.0, math.max(16.0, size.width - 16 - child.width));
    var y = anchor.bottom + 4;
    if (y + child.height > size.height - 16 && anchor.top - 4 - child.height >= 16) y = anchor.top - 4 - child.height;
    return Offset(x, y);
  }

  @override
  bool shouldRelayout(_MenuLayout old) => old.anchor != anchor || old.end != end || old.direction != direction;
}
