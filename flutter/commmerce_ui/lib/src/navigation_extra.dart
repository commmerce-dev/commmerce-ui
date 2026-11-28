import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'generated/icons.g.dart';
import 'generated/tokens.g.dart';
import 'icon.dart';
import 'navigation.dart';
import 'strings.dart';
import 'theme.dart';

/// The admin's tab bar on phones and small tablets: up to five destinations, an icon over an
/// uppercase label, in a white bar with rounded top corners. Mirrors `<cm-bottom-navigation>`.
///
/// Mark the main action [CmNavItem.primary] (Quick add) to draw its icon as a black square. The last
/// item ("More") usually opens a [CmMobileMenu]. For Commmerce products only, not for apps.
class CmBottomNavigation extends StatelessWidget {
  const CmBottomNavigation({super.key, required this.items, required this.onSelected, this.selectedId, this.semanticLabel = 'Main'});

  /// Destinations; only the first five are shown. One word each: "Home", "Products", "Orders", "More".
  final List<CmNavItem> items;
  final ValueChanged<CmNavItem> onSelected;

  /// The id of the current page.
  final String? selectedId;

  /// Accessible name of the navigation.
  final String semanticLabel;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final bottom = MediaQuery.paddingOf(context).bottom;
    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: semanticLabel,
      child: Container(
        padding: EdgeInsets.fromLTRB(CmSpace.s4, CmSpace.s8, CmSpace.s4, CmSpace.s8 + bottom),
        decoration: BoxDecoration(color: c.bgSurface, borderRadius: const BorderRadius.vertical(top: Radius.circular(CmRadius.lg)), border: Border.all(color: c.borderSubtle)),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          for (final it in items.take(5))
            Expanded(child: _BottomItem(item: it, current: it.id == selectedId, onTap: () => onSelected(it))),
        ]),
      ),
    );
  }
}

class _BottomItem extends StatefulWidget {
  const _BottomItem({required this.item, required this.current, required this.onTap});
  final CmNavItem item;
  final bool current;
  final VoidCallback onTap;

  @override
  State<_BottomItem> createState() => _BottomItemState();
}

class _BottomItemState extends State<_BottomItem> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final it = widget.item;
    final fg = widget.current || _hover ? c.textDefault : c.textTertiary;
    final icon = it.icon == null
        ? const SizedBox.square(dimension: 24)
        : it.primary
            ? Container(
                width: 24, height: 24,
                decoration: BoxDecoration(color: c.actionPrimary, borderRadius: BorderRadius.circular(CmRadius.xs)),
                child: Center(child: CmIcon(it.icon!, size: 16, color: c.actionPrimaryText)),
              )
            : SizedBox.square(dimension: 26, child: Center(child: CmIcon(it.icon!, size: 24, color: widget.current ? c.iconSelected : fg)));
    return Semantics(
      button: true,
      selected: widget.current,
      label: it.label,
      excludeSemantics: true, onTap: widget.onTap,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: widget.onTap,
          onHover: (v) => setState(() => _hover = v),
          borderRadius: BorderRadius.circular(CmRadius.sm),
          hoverColor: Colors.transparent,
          focusColor: c.bgHover,
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: 48),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(2, 2, 2, 0),
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                icon,
                const SizedBox(height: CmSpace.s4),
                Text(it.label, maxLines: 1, overflow: TextOverflow.ellipsis, style: cmCaps(12, fg)),
              ]),
            ),
          ),
        ),
      ),
    );
  }
}

/// A row of links between sibling pages, such as the sections of Settings or the parts of a product.
/// Looks like status tabs, but each tab is its own page; the current one is black and underlined.
/// Too many tabs for the width scroll sideways. Mirrors `<cm-link-tabs>`.
///
/// To filter one list without leaving the page, use [CmStatusTabs] instead.
class CmLinkTabs extends StatelessWidget {
  const CmLinkTabs({super.key, required this.tabs, required this.selectedId, required this.onSelected, this.semanticLabel = 'Sections'});

  /// Tabs; [CmNavItem.count] shows in brackets after the label.
  final List<CmNavItem> tabs;

  /// The id of the page you are on.
  final String selectedId;
  final ValueChanged<CmNavItem> onSelected;

  /// Accessible name, e.g. "Settings sections".
  final String semanticLabel;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final phone = CmBreakpoints.of(context) == CmScreen.phone;
    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: semanticLabel,
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(border: Border(bottom: BorderSide(color: c.borderSubtle))),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.fromLTRB(2, 2, 2, 0),
          child: Row(children: [
            for (var i = 0; i < tabs.length; i++) ...[
              if (i > 0) SizedBox(width: phone ? 18 : 28),
              _LinkTab(tab: tabs[i], current: tabs[i].id == selectedId, phone: phone, onTap: () => onSelected(tabs[i])),
            ],
          ]),
        ),
      ),
    );
  }
}

class _LinkTab extends StatefulWidget {
  const _LinkTab({required this.tab, required this.current, required this.phone, required this.onTap});
  final CmNavItem tab;
  final bool current, phone;
  final VoidCallback onTap;

  @override
  State<_LinkTab> createState() => _LinkTabState();
}

class _LinkTabState extends State<_LinkTab> {
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final t = widget.tab;
    final fg = widget.current || _hover ? c.textDefault : c.textTertiary;
    return Semantics(
      link: true,
      selected: widget.current,
      label: t.count == null ? t.label : '${t.label}, ${t.count}',
      excludeSemantics: true, onTap: widget.onTap,
      child: InkWell(
        onTap: widget.onTap,
        onHover: (v) => setState(() => _hover = v),
        hoverColor: Colors.transparent,
        borderRadius: BorderRadius.circular(CmRadius.xs),
        child: Container(
          padding: const EdgeInsets.only(top: 4, bottom: 12),
          decoration: BoxDecoration(border: Border(bottom: BorderSide(color: widget.current ? c.borderStrong : Colors.transparent, width: 2))),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Text(t.label, style: TextStyle(fontFamily: cmFontFamily, package: cmFontPackage, fontSize: widget.phone ? 14 : 16, fontWeight: FontWeight.w500, color: fg)),
            if (t.count != null) ...[const SizedBox(width: CmSpace.s4), Text('(${t.count})', style: CmType.bodySm.copyWith(color: c.textTertiary))],
          ]),
        ),
      ),
    );
  }
}

/// A titled group of rows in a [CmMobileMenu]. Leave [label] null for a card without a heading.
class CmMenuSection {
  const CmMenuSection({this.label, required this.items});
  final String? label;

  /// Rows. A row with [CmNavItem.children] opens them on a second screen; a [CmNavItem.primary] row
  /// is the section's centred action ("Add channel").
  final List<CmNavItem> items;
}

/// The admin's full menu on phones, opened from "More" in [CmBottomNavigation]: a grey page of white
/// rounded cards with the store and user first, then labelled sections of rows. Rows with sub-items
/// open them on a second screen with a back button (Escape also goes back). Mirrors `<cm-mobile-menu>`.
/// For Commmerce products only, not for apps.
class CmMobileMenu extends StatefulWidget {
  const CmMobileMenu({
    super.key,
    required this.sections,
    required this.onSelected,
    this.selectedId,
    this.store,
    this.onStoreTap,
    this.userName,
    this.userEmail,
    this.avatar,
    this.onAccountTap,
    this.semanticLabel = 'Menu',
  });

  final List<CmMenuSection> sections;

  /// Called when a row without sub-items (or a sub-item, or an action) is chosen.
  final ValueChanged<CmNavItem> onSelected;

  /// The id of the current page.
  final String? selectedId;

  /// Store the merchant is signed in to. Null hides the store row.
  final String? store;
  final VoidCallback? onStoreTap;

  /// Signed-in user's name. Null hides the user row.
  final String? userName;
  final String? userEmail;

  /// Avatar image; without it the first letter of the name is shown.
  final Widget? avatar;
  final VoidCallback? onAccountTap;
  final String semanticLabel;

  @override
  State<CmMobileMenu> createState() => _CmMobileMenuState();
}

class _CmMobileMenuState extends State<CmMobileMenu> {
  (int, int)? _page;
  final _back = FocusNode(debugLabel: 'CmMobileMenu back');
  final Map<(int, int), FocusNode> _rows = {};

  FocusNode _rowNode((int, int) key) => _rows.putIfAbsent(key, () => FocusNode(debugLabel: 'CmMobileMenu row $key'));

  @override
  void dispose() {
    _back.dispose();
    for (final n in _rows.values) {
      n.dispose();
    }
    super.dispose();
  }

  void _open(int s, int r) {
    setState(() => _page = (s, r));
    WidgetsBinding.instance.addPostFrameCallback((_) { if (mounted) _back.requestFocus(); });
  }

  void _goBack() {
    final p = _page;
    if (p == null) return;
    setState(() => _page = null);
    WidgetsBinding.instance.addPostFrameCallback((_) { if (mounted) _rowNode(p).requestFocus(); });
  }

  Widget _card(BuildContext context, List<Widget> rows) {
    final c = CmTheme.colorsOf(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: CmSpace.s16),
      decoration: BoxDecoration(color: c.bgSurface, borderRadius: BorderRadius.circular(CmRadius.lg)),
      child: Material(
        color: Colors.transparent,
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          for (var i = 0; i < rows.length; i++)
            DecoratedBox(
              decoration: BoxDecoration(border: i == 0 ? null : Border(top: BorderSide(color: c.borderSubtle))),
              child: rows[i],
            ),
        ]),
      ),
    );
  }

  Widget _heading(BuildContext context, String text) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Semantics(header: true, child: Text(text, style: cmCaps(13, CmTheme.colorsOf(context).textTertiary))),
      );

  Widget _row(
    BuildContext context, {
    required String label,
    required VoidCallback onTap,
    String? icon,
    String? badge,
    bool chevron = false,
    bool selected = false,
    bool sub = false,
    String? hint,
    FocusNode? focusNode,
    Widget? leading,
    Widget? content,
  }) {
    final c = CmTheme.colorsOf(context);
    return Semantics(
      button: true,
      selected: selected,
      label: badge == null ? label : '$label, $badge',
      hint: hint,
      excludeSemantics: true, onTap: onTap,
      child: InkWell(
        onTap: onTap,
        focusNode: focusNode,
        borderRadius: BorderRadius.circular(CmRadius.sm),
        child: ConstrainedBox(
          constraints: BoxConstraints(minHeight: sub ? 48 : 52),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(CmSpace.s8, CmSpace.s8, CmSpace.s4, CmSpace.s8),
            child: Row(children: [
              if (leading != null) ...[leading, const SizedBox(width: CmSpace.s16)],
              if (icon != null && !sub) ...[CmIcon(icon, size: 24, color: c.iconResponsiveMenu), const SizedBox(width: CmSpace.s16)],
              Expanded(
                flex: 3,
                child: content ??
                    Text(label, style: TextStyle(fontFamily: cmFontFamily, package: cmFontPackage, fontSize: sub ? 16 : 18, fontWeight: FontWeight.w500, color: c.textDefault)),
              ),
              if (badge != null) ...[
                const SizedBox(width: CmSpace.s8),
                // Shares the row with the label in narrow menus instead of pushing past the edge.
                Flexible(
                  flex: 2,
                  child: Align(
                    alignment: Alignment.centerRight,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: CmSpace.s8, vertical: 2),
                      decoration: BoxDecoration(color: c.navBadge, borderRadius: BorderRadius.circular(CmRadius.full)),
                      child: Text(badge, maxLines: 1, overflow: TextOverflow.ellipsis, style: cmCaps(12, c.textOnDark).copyWith(fontFeatures: const [FontFeature.tabularFigures()])),
                    ),
                  ),
                ),
              ],
              if (chevron) ...[const SizedBox(width: CmSpace.s16), CmIcon(CmIcons.chevronRight, size: 16, color: c.iconSelected)],
            ]),
          ),
        ),
      ),
    );
  }

  Widget _item(BuildContext context, CmNavItem it, int s, int r) {
    final c = CmTheme.colorsOf(context);
    if (it.primary) {
      return Semantics(
        button: true,
        label: it.label,
        excludeSemantics: true, onTap: () => widget.onSelected(it),
        child: InkWell(
          onTap: () => widget.onSelected(it),
          borderRadius: BorderRadius.circular(CmRadius.sm),
          child: Container(constraints: const BoxConstraints(minHeight: 40), alignment: Alignment.center, child: Text(it.label, style: cmCaps(14, c.textDefault))),
        ),
      );
    }
    final kids = it.children.isNotEmpty;
    return _row(
      context,
      label: it.label,
      icon: it.icon,
      badge: it.badge,
      chevron: true,
      selected: it.id == widget.selectedId || it.children.any((k) => k.id == widget.selectedId),
      hint: kids ? CmStrings.of(context).opens(it.label) : null,
      focusNode: kids ? _rowNode((s, r)) : null,
      onTap: kids ? () => _open(s, r) : () => widget.onSelected(it),
    );
  }

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final p = _page;
    final page = p == null || p.$1 >= widget.sections.length || p.$2 >= widget.sections[p.$1].items.length ? null : widget.sections[p.$1].items[p.$2];
    final List<Widget> children;
    if (page != null) {
      children = [
        Align(
          alignment: Alignment.centerLeft,
          child: Semantics(
            button: true,
            label: CmStrings.of(context).back,
            hint: page.label,
            excludeSemantics: true, onTap: _goBack,
            child: InkWell(
              focusNode: _back,
              onTap: _goBack,
              borderRadius: BorderRadius.circular(CmRadius.sm),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: CmSpace.s4, vertical: CmSpace.s8),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  CmIcon(CmIcons.arrowLeft, size: 18, color: c.textDefault),
                  const SizedBox(width: 8),
                  Text(page.label, style: CmType.bodyLg.copyWith(fontWeight: FontWeight.w500, color: c.textDefault)),
                ]),
              ),
            ),
          ),
        ),
        Semantics(
          container: true,
          label: page.label,
          explicitChildNodes: true,
          child: _card(context, [
            for (final k in page.children) _row(context, label: k.label, badge: k.badge, sub: true, selected: k.id == widget.selectedId, onTap: () => widget.onSelected(k)),
          ]),
        ),
      ];
    } else {
      final initial = (widget.userName ?? '').trim().isEmpty ? '' : widget.userName!.trim()[0].toUpperCase();
      children = [
        if (widget.store != null || widget.userName != null)
          Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            _heading(context, CmStrings.of(context).profile),
            _card(context, [
              if (widget.store != null)
                _row(
                  context,
                  label: CmStrings.of(context).loggedInToStore(widget.store!),
                  hint: CmStrings.of(context).switchStore,
                  chevron: true,
                  onTap: () => widget.onStoreTap?.call(),
                  content: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(CmStrings.of(context).loggedInToStoreCaps, style: cmCaps(12, c.textTertiary).copyWith(fontWeight: FontWeight.w400)),
                    const SizedBox(height: 2),
                    Text(widget.store!, style: TextStyle(fontFamily: cmFontFamily, package: cmFontPackage, fontSize: 18, fontWeight: FontWeight.w500, color: c.textDefault)),
                  ]),
                ),
              if (widget.userName != null)
                _row(
                  context,
                  label: [widget.userName!, if (widget.userEmail != null) widget.userEmail!].join(', '),
                  hint: CmStrings.of(context).account,
                  chevron: true,
                  onTap: () => widget.onAccountTap?.call(),
                  leading: Container(
                    width: 36, height: 36,
                    clipBehavior: Clip.antiAlias,
                    decoration: BoxDecoration(color: c.avatarBg, shape: BoxShape.circle, border: Border.all(color: c.borderStrong)),
                    child: widget.avatar ?? Center(child: Text(initial, style: CmType.bodySm.copyWith(color: c.textDefault))),
                  ),
                  content: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(widget.userName!, style: TextStyle(fontFamily: cmFontFamily, package: cmFontPackage, fontSize: 18, fontWeight: FontWeight.w500, color: c.textDefault)),
                    if (widget.userEmail != null) Text(widget.userEmail!, style: CmType.bodySm.copyWith(color: c.textDefault)),
                  ]),
                ),
            ]),
          ]),
        for (var s = 0; s < widget.sections.length; s++)
          Semantics(
            container: true,
            explicitChildNodes: true,
            label: widget.sections[s].label,
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              if (widget.sections[s].label != null) _heading(context, widget.sections[s].label!),
              _card(context, [for (var r = 0; r < widget.sections[s].items.length; r++) _item(context, widget.sections[s].items[r], s, r)]),
            ]),
          ),
      ];
    }
    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: widget.semanticLabel,
      child: CallbackShortcuts(
        bindings: {if (page != null) const SingleActivator(LogicalKeyboardKey.escape): _goBack},
        child: Container(
          color: c.bgPage,
          padding: const EdgeInsets.all(CmSpace.s20),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, children: [
            for (var i = 0; i < children.length; i++) ...[if (i > 0) const SizedBox(height: CmSpace.s20), children[i]],
          ]),
        ),
      ),
    );
  }
}

/// A dark strip across the top of the page with one short offer or call to action and a green link:
/// "Publish your store with a Commmerce plan - Click here to pick a plan". Mirrors `<cm-flash-offer-bar>`.
///
/// With [onDismiss] it shows a close button and hides itself when pressed; remember the choice so the
/// bar doesn't come back on every page.
class CmFlashOfferBar extends StatefulWidget {
  const CmFlashOfferBar({super.key, required this.message, this.linkText, this.onLinkTap, this.trailing, this.icon = CmIcons.send, this.onDismiss, this.semanticLabel = 'Offer'});

  /// Text before the link: "Publish your store with a Commmerce plan - ".
  final String message;

  /// The one link, in green: "See plans".
  final String? linkText;
  final VoidCallback? onLinkTap;

  /// Text after the link: " to pick a plan".
  final String? trailing;

  /// Leading icon from [CmIcons]; null hides it.
  final String? icon;

  /// Shows a close button named "Dismiss offer".
  final VoidCallback? onDismiss;

  /// Accessible name of the bar.
  final String semanticLabel;

  @override
  State<CmFlashOfferBar> createState() => _CmFlashOfferBarState();
}

class _CmFlashOfferBarState extends State<CmFlashOfferBar> {
  bool _hidden = false, _linkHover = false, _linkFocus = false;

  @override
  Widget build(BuildContext context) {
    if (_hidden) return const SizedBox.shrink();
    final c = CmTheme.colorsOf(context);
    final phone = CmBreakpoints.of(context) == CmScreen.phone;
    final size = phone ? 14.0 : 18.0;
    final style = TextStyle(fontFamily: cmFontFamily, package: cmFontPackage, fontSize: size, height: 1.4, color: c.textOnDark);
    final link = widget.linkText == null
        ? null
        : WidgetSpan(
            alignment: PlaceholderAlignment.baseline,
            baseline: TextBaseline.alphabetic,
            child: Semantics(
              link: true,
              label: widget.linkText,
              excludeSemantics: true, onTap: widget.onLinkTap,
              child: FocusableActionDetector(
                mouseCursor: SystemMouseCursors.click,
                onShowHoverHighlight: (v) => setState(() => _linkHover = v),
                onShowFocusHighlight: (v) => setState(() => _linkFocus = v),
                actions: {ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) { widget.onLinkTap?.call(); return null; })},
                child: GestureDetector(
                  onTap: widget.onLinkTap,
                  child: Container(
                    decoration: _linkFocus ? BoxDecoration(border: Border.all(color: c.textOnDark, width: 2), borderRadius: BorderRadius.circular(CmRadius.xs)) : null,
                    child: Text(widget.linkText!,
                        style: style.copyWith(color: c.textSpecialityOnDark, fontWeight: FontWeight.w500, decoration: _linkHover ? TextDecoration.underline : null, decorationColor: c.textSpecialityOnDark)),
                  ),
                ),
              ),
            ),
          );
    final text = Text.rich(
      TextSpan(style: style, children: [TextSpan(text: widget.message), if (link != null) link, if (widget.trailing != null) TextSpan(text: widget.trailing)]),
      textAlign: phone ? TextAlign.start : TextAlign.center,
    );
    final dismissible = widget.onDismiss != null;
    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: widget.semanticLabel,
      child: Container(
        width: double.infinity,
        constraints: BoxConstraints(minHeight: phone ? 44 : 56),
        color: c.bgFlashBar,
        // Dismissible: 48 on each side, as on the web (the end side holds a 12 gap, the 32 close button and 4).
        padding: EdgeInsets.fromLTRB(dismissible ? CmSpace.s48 : CmSpace.s20, CmSpace.s8, dismissible ? CmSpace.s4 : CmSpace.s20, CmSpace.s8),
        child: Row(children: [
          Expanded(
            child: Row(mainAxisAlignment: phone ? MainAxisAlignment.start : MainAxisAlignment.center, children: [
              if (widget.icon != null) ...[CmIcon(widget.icon!, size: 20, color: c.textSpecialityOnDark), const SizedBox(width: CmSpace.s8)],
              Flexible(child: text),
            ]),
          ),
          if (dismissible) ...[
            const SizedBox(width: 12),
            Semantics(
              button: true,
              label: CmStrings.of(context).dismissOffer,
              excludeSemantics: true, onTap: () {
                    setState(() => _hidden = true);
                    widget.onDismiss!();
                  },
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  customBorder: const CircleBorder(),
                  hoverColor: c.navActive,
                  focusColor: c.navActive,
                  onTap: () {
                    setState(() => _hidden = true);
                    widget.onDismiss!();
                  },
                  child: SizedBox.square(dimension: 32, child: Center(child: CmIcon(CmIcons.close, size: 18, color: c.textOnDark))),
                ),
              ),
            ),
          ],
        ]),
      ),
    );
  }
}
