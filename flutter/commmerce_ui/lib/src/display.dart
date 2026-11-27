import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'button.dart';
import 'check_box.dart';
import 'generated/icons.g.dart';
import 'generated/tokens.g.dart';
import 'header_wrap.dart';
import 'icon.dart';
import 'strings.dart';
import 'theme.dart';

/// Meaning of a status colour. Information is orange and attention is blue in this system.
enum CmTone { neutral, attention, information, success, critical }

/// Status pill in sentence case ("Order placed", "Paid"): 24 tall, 12px medium text (owner standard, 1.6).
/// Mirrors `<cm-badge>`.
class CmBadge extends StatelessWidget {
  const CmBadge(this.label, {super.key, this.tone = CmTone.neutral});
  final String label;
  final CmTone tone;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final (bg, fg) = switch (tone) {
      CmTone.neutral => (c.bgTag, c.textDefault),
      CmTone.attention => (c.bgAttention, c.textAttention),
      CmTone.information => (c.bgInformationSoft, c.textInformation),
      CmTone.success => (c.bgSuccessSoft, c.textSuccess),
      CmTone.critical => (c.bgCritical, c.textCritical),
    };
    return Container(
      height: 24,
      padding: const EdgeInsets.symmetric(horizontal: CmSpace.s8),
      decoration: BoxDecoration(color: Color.alphaBlend(bg, c.bgSurface), borderRadius: BorderRadius.circular(CmRadius.full)),
      // Centre without Container.alignment, which would stretch the badge to the full width it is offered.
      child: Center(widthFactor: 1, child: Text(label, style: cmCaps(12, fg).copyWith(height: 1, fontFeatures: const [FontFeature.tabularFigures()]))),
    );
  }
}

/// A chip for a value such as a product tag, optionally removable. 24 tall with 12px text (owner standard, 1.6),
/// a 20px remove button. Mirrors `<cm-tag>`.
class CmTag extends StatefulWidget {
  const CmTag(this.label, {super.key, this.onRemove, this.focusNode, this.onKeyEvent, this.removeLabel, this.tabStop = true});
  final String label;
  final VoidCallback? onRemove;

  /// Focus node of the remove button, for widgets that move focus between tags themselves ([CmCombobox]). Since 1.7.
  final FocusNode? focusNode;

  /// Keys pressed while the remove button has focus. Since 1.7.
  final FocusOnKeyEventCallback? onKeyEvent;

  /// Accessible name of the remove button. Default: [CmStrings.tagRemove] ("Remove Wholesale").
  final String? removeLabel;

  /// False keeps the remove button out of the Tab order (it can still be focused from code). Since 1.7.
  final bool tabStop;

  @override
  State<CmTag> createState() => _CmTagState();
}

class _CmTagState extends State<CmTag> {
  bool _hover = false, _focus = false;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final remove = widget.onRemove;
    return Container(
      height: 24,
      padding: EdgeInsetsDirectional.only(start: CmSpace.s8, end: remove == null ? CmSpace.s8 : CmSpace.s4 / 2),
      decoration: BoxDecoration(color: c.bgTag, border: Border.all(color: c.borderStrong), borderRadius: BorderRadius.circular(CmRadius.full)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Flexible(child: Text(widget.label, maxLines: 1, overflow: TextOverflow.ellipsis, style: CmType.bodyXs.copyWith(color: c.textDefault))),
        if (remove != null) ...[
          const SizedBox(width: CmSpace.s4),
          Semantics(
            button: true,
            label: widget.removeLabel ?? CmStrings.of(context).tagRemove(widget.label),
            excludeSemantics: true,
            onTap: remove,
            child: Focus(
              canRequestFocus: false,
              skipTraversal: true,
              onKeyEvent: widget.onKeyEvent,
              child: ExcludeFocusTraversal(
                excluding: !widget.tabStop,
                child: FocusableActionDetector(
                  focusNode: widget.focusNode,
                  mouseCursor: SystemMouseCursors.click,
                  onShowHoverHighlight: (v) => setState(() => _hover = v),
                  onFocusChange: (v) => setState(() => _focus = v),
                  actions: {ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) { remove(); return null; })},
                  child: GestureDetector(
                    onTap: remove,
                    child: Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        color: _hover ? c.bgHover : null,
                        shape: BoxShape.circle,
                        border: _focus ? Border.all(color: c.borderStrong, width: 2) : null,
                      ),
                      child: Center(child: CmIcon(CmIcons.close, size: 14, color: _hover ? c.textDefault : c.iconSelected)),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ]),
    );
  }
}

/// A full-width message about the page or a task. Mirrors `<cm-banner>`.
class CmBanner extends StatelessWidget {
  const CmBanner({super.key, required this.message, this.tone = CmTone.attention, this.heading, this.onDismiss, this.actions = const []});
  final String message;
  final CmTone tone;
  final String? heading;

  /// Shows a close button.
  final VoidCallback? onDismiss;

  /// Buttons under the message.
  final List<Widget> actions;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final (bg, iconColor) = switch (tone) {
      CmTone.information => (c.bgInformation, c.textDefault),
      CmTone.success => (c.bgSuccess, c.textDefault),
      CmTone.critical => (c.bgCritical, c.iconCritical),
      _ => (c.bgAttention, c.textAttention),
    };
    final critical = tone == CmTone.critical;
    return Semantics(
      container: true,
      liveRegion: true,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: CmSpace.s20, vertical: CmSpace.s16),
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(CmRadius.md)),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Padding(padding: const EdgeInsets.only(top: 2), child: CmIcon(tone == CmTone.success ? CmIcons.check : CmIcons.alert, size: 20, color: iconColor)),
          const SizedBox(width: CmSpace.s16),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              if (heading != null)
                Text(heading!, style: CmType.bodyLg.copyWith(fontWeight: FontWeight.w600, color: critical ? c.textCritical : c.textDefault)),
              Text(message, style: CmType.bodyMd.copyWith(color: c.textDefault)),
              if (actions.isNotEmpty) Padding(padding: const EdgeInsets.only(top: CmSpace.s8), child: Wrap(spacing: CmSpace.s8, runSpacing: CmSpace.s8, children: actions)),
            ]),
          ),
          if (onDismiss != null)
            Semantics(
              button: true,
              label: CmStrings.of(context).dismiss,
              excludeSemantics: true, onTap: onDismiss,
              child: InkWell(onTap: onDismiss, child: Padding(padding: const EdgeInsets.all(4), child: CmIcon(CmIcons.close, size: 16, color: c.textDefault))),
            ),
        ]),
      ),
    );
  }
}

/// Padding and spacing of a [CmCard] (owner standard, 1.6).
enum CmCardVariant {
  /// 24px padding, 16px between the header and the body. The default.
  standard,

  /// 16px padding, 12px under the header: dashboards, task summaries, metrics.
  compact,
}

/// White section card with optional heading, description and header actions. Mirrors `<cm-card>`.
///
/// Flat: a 1px border-subtle, radius 8, no shadow (shadows are for overlays). [variant] sets the padding:
/// [CmCardVariant.standard] (24, 16 under the header) or [CmCardVariant.compact] (16, 12). On phones (640px or
/// less) every card has 16px padding.
///
/// With [onPressed] the card is interactive (web `variant="interactive"`): the whole card is one button, with hover
/// (darker outline, tinted), pressed, focus (a 2px ring outside the card) and [selected] (a 2px dark outline)
/// states. Its accessible name is the [heading] (or [semanticLabel]). Header [actions] and controls in the body stay
/// separately pressable and reachable by screen readers.
///
/// The content sits on a transparent [Material], so ink widgets such as [ListTile] and [InkWell] work inside the
/// card without a Scaffold above it.
class CmCard extends StatefulWidget {
  const CmCard({
    super.key,
    this.heading,
    this.description,
    this.actions = const [],
    this.adornment,
    this.flush = false,
    this.variant = CmCardVariant.standard,
    this.onPressed,
    this.selected = false,
    this.semanticLabel,
    required this.child,
  });

  /// An interactive card (web `variant="interactive"`): the whole card is pressed through [onPressed].
  const CmCard.interactive({
    super.key,
    this.heading,
    this.description,
    this.actions = const [],
    this.adornment,
    this.variant = CmCardVariant.standard,
    required VoidCallback this.onPressed,
    this.selected = false,
    this.semanticLabel,
    required this.child,
  }) : flush = false;

  final String? heading;

  /// One sentence under the heading, 13px in text-tertiary.
  final String? description;
  final List<Widget> actions;

  /// Badge or icon next to the heading.
  final Widget? adornment;

  /// Removes body padding, for lists that run edge to edge.
  final bool flush;

  /// Standard (24px padding) or compact (16px). Since 1.6.
  final CmCardVariant variant;

  /// Makes the whole card a button (interactive card). Since 1.6.
  final VoidCallback? onPressed;

  /// Interactive cards: shows the card as chosen (a 2px dark outline), reported as selected. Since 1.6.
  final bool selected;

  /// Interactive cards without a [heading]: the accessible name of the card. Since 1.6.
  final String? semanticLabel;
  final Widget child;

  /// Whether this card is interactive.
  bool get interactive => onPressed != null;

  @override
  State<CmCard> createState() => _CmCardState();
}

class _CmCardState extends State<CmCard> {
  bool _hover = false, _focus = false, _pressed = false;

  void _set(VoidCallback f) => setState(f);

  @override
  Widget build(BuildContext context) {
    final w = widget;
    final c = CmTheme.colorsOf(context);
    final compact = w.variant == CmCardVariant.compact;
    final pad = cmIsNarrow(context) || compact ? CmSpace.s16 : CmSpace.s24;
    final gap = compact ? CmSpace.s12 : CmSpace.s16;
    final headingStyle = CmType.headingSm.copyWith(color: c.textDefault);
    final headPad = EdgeInsets.fromLTRB(w.flush ? pad : 0, w.flush ? pad : 0, w.flush ? pad : 0, w.flush ? CmSpace.s8 : gap);
    final head = w.heading == null && w.description == null
        // Since 1.3, actions on a card without a heading or description get a row of their own, at the end.
        ? (w.actions.isEmpty
            ? null
            : Padding(
                padding: headPad,
                child: Align(alignment: AlignmentDirectional.centerEnd, child: Wrap(spacing: CmSpace.s8, runSpacing: CmSpace.s8, children: w.actions)),
              ))
        : Padding(
            padding: headPad,
            // On narrow cards the actions move under the title rather than squeeze it below about 12 characters,
            // and the adornment wraps under the heading (web: cm-card, 1.2).
            child: CmHeaderWrap(
              minLeadWidth: _strut(context, headingStyle),
              gap: CmSpace.s16,
              // An interactive card is already named by its heading, so the heading and description aren't read twice.
              lead: ExcludeSemantics(excluding: w.interactive, child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                if (w.heading != null)
                  Semantics(header: true, child: Wrap(spacing: CmSpace.s8, runSpacing: CmSpace.s8, crossAxisAlignment: WrapCrossAlignment.center, children: [
                    Text(w.heading!, style: w.interactive && _hover ? headingStyle.copyWith(decoration: TextDecoration.underline) : headingStyle),
                    ?w.adornment,
                  ])),
                if (w.description != null) Padding(padding: const EdgeInsets.only(top: CmSpace.s4), child: Text(w.description!, style: CmType.bodySm.copyWith(color: c.textTertiary))),
              ])),
              trailing: w.actions.isEmpty ? const SizedBox.shrink() : Wrap(spacing: CmSpace.s8, runSpacing: CmSpace.s8, crossAxisAlignment: WrapCrossAlignment.center, children: w.actions),
            ),
          );
    final interactive = w.interactive;
    Color bg = c.bgSurface, border = c.borderSubtle;
    double borderWidth = 1;
    if (interactive) {
      if (_hover) {
        bg = c.bgHover;
        border = c.borderInput;
      }
      if (_pressed) bg = Color.lerp(c.bgHover, c.textDefault, 0.06)!;
      if (w.selected) {
        border = c.borderStrong;
        borderWidth = 2;
      }
    }
    Widget card = AnimatedContainer(
      duration: cmDuration(context, CmMotion.fast),
      curve: CmMotion.standard,
      width: double.infinity,
      // A 2px selected outline takes 1px more from the padding, so the content doesn't move.
      padding: w.flush ? EdgeInsets.zero : EdgeInsets.all(pad - (borderWidth - 1)),
      decoration: BoxDecoration(
        color: bg,
        border: Border.all(color: border, width: borderWidth),
        borderRadius: BorderRadius.circular(CmRadius.md),
        boxShadow: interactive && _focus ? [BoxShadow(color: c.bgPage, spreadRadius: 2), BoxShadow(color: c.borderStrong, spreadRadius: 4)] : null,
      ),
      // A transparent Material, so ink widgets in the card (ListTile, InkWell) work without a Scaffold above it.
      child: Material(
        type: MaterialType.transparency,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [?head, w.child]),
      ),
    );
    if (!interactive) return card;
    return Semantics(
      container: true,
      explicitChildNodes: true,
      button: true,
      selected: w.selected,
      label: w.heading ?? w.semanticLabel,
      onTap: w.onPressed,
      child: FocusableActionDetector(
        mouseCursor: SystemMouseCursors.click,
        onShowHoverHighlight: (v) => _set(() => _hover = v),
        onShowFocusHighlight: (v) => _set(() => _focus = v),
        actions: {ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) { w.onPressed?.call(); return null; })},
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: w.onPressed,
          onTapDown: (_) => _set(() => _pressed = true),
          onTapUp: (_) => _set(() => _pressed = false),
          onTapCancel: () => _set(() => _pressed = false),
          child: card,
        ),
      ),
    );
  }

  /// The heading on one line, capped at 12 characters: the narrowest the title gets beside the actions.
  double _strut(BuildContext context, TextStyle style) {
    final text = widget.heading ?? '';
    if (text.isEmpty) return 0;
    final chars = text.characters;
    final tp = TextPainter(
      text: TextSpan(text: chars.length > 12 ? chars.take(12).toString() : text, style: style),
      maxLines: 1,
      textDirection: Directionality.of(context),
      textScaler: MediaQuery.textScalerOf(context),
    )..layout();
    final w = tp.width;
    tp.dispose();
    return w;
  }
}

/// A label/value pair in a [CmInfoPanel].
class CmInfoItem {
  const CmInfoItem(this.label, this.value, {this.half = false});
  final String label;
  final Widget value;

  /// Two half items sit side by side.
  final bool half;
}

/// How a [CmInfoPanel] lays out its facts.
enum CmInfoLayout {
  /// Each label (13/18 text-tertiary) over its value (14/20 medium), 4 apart; facts 12 apart; two [CmInfoItem.half]
  /// items share a line, 20 apart. The default (owner standard since 1.7.1).
  stacked,

  /// Each fact on one row: the label on the start side (two fifths of the width, 13/18 text-tertiary) and the value
  /// beside it (14/20 medium), 12 apart; rows 12 apart. [CmInfoItem.half] is ignored. Fits the 320 aside of a
  /// [CmRecordLayout]. Since 1.7.
  rows,
}

/// The side card on detail pages listing label/value pairs. Mirrors `<cm-info-panel>`.
///
/// On record pages (since 1.7) use [variant] [CmCardVariant.compact] (16 padding, 12 under the title, like a compact
/// [CmCard]) and [layout] [CmInfoLayout.rows]: each fact on one row, the way a CRM's Details card reads.
///
/// Padding follows the card standard: 24 ([CmCardVariant.standard]), 16 ([CmCardVariant.compact]).
class CmInfoPanel extends StatelessWidget {
  const CmInfoPanel({super.key, required this.heading, required this.items, this.action, this.onAction, this.variant = CmCardVariant.standard, this.layout = CmInfoLayout.stacked});
  final String heading;
  final List<CmInfoItem> items;

  /// Text action in the header, in sentence case ("Remove", "Edit").
  final String? action;
  final VoidCallback? onAction;

  /// [CmCardVariant.standard] (the default) or [CmCardVariant.compact] (16 padding, 12 under the title). Since 1.7.
  final CmCardVariant variant;

  /// [CmInfoLayout.stacked] (the default) or [CmInfoLayout.rows]. Since 1.7.
  final CmInfoLayout layout;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    return CmCard(
      heading: heading,
      variant: variant,
      actions: [if (action != null) TextButton(onPressed: onAction, child: Text(action!, style: cmCaps(14, c.textDefault)))],
      child: layout == CmInfoLayout.rows
          ? Column(crossAxisAlignment: CrossAxisAlignment.stretch, mainAxisSize: MainAxisSize.min, spacing: CmSpace.s12, children: [
              for (final i in items)
                MergeSemantics(
                  child: Row(crossAxisAlignment: CrossAxisAlignment.baseline, textBaseline: TextBaseline.alphabetic, children: [
                    Expanded(flex: 2, child: Text(i.label, style: CmType.bodySm.copyWith(color: c.textTertiary))),
                    const SizedBox(width: CmSpace.s12),
                    Expanded(
                      flex: 3,
                      child: DefaultTextStyle.merge(style: CmType.bodyMd.copyWith(fontWeight: FontWeight.w500, color: c.textDefault), child: i.value),
                    ),
                  ]),
                ),
            ])
          : LayoutBuilder(builder: (context, box) {
              // Owner standard (web cm-info-panel): 13/18 text-tertiary labels, 4 above 14/20 medium values, facts 12
              // apart; two half items share a line 20 apart.
              final half = math.max(0.0, (box.maxWidth - CmSpace.s20) / 2);
              return Wrap(spacing: CmSpace.s20, runSpacing: CmSpace.s12, children: [
                for (final i in items)
                  SizedBox(
                    width: i.half ? half : box.maxWidth,
                    child: MergeSemantics(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(i.label, style: CmType.bodySm.copyWith(color: c.textTertiary)),
                        const SizedBox(height: CmSpace.s4),
                        DefaultTextStyle.merge(style: CmType.bodyMd.copyWith(fontWeight: FontWeight.w500, color: c.textDefault), child: i.value),
                      ]),
                    ),
                  ),
              ]);
            }),
    );
  }
}

/// A breadcrumb link above a page title.
class CmBreadcrumb {
  const CmBreadcrumb(this.label, {this.onTap});
  final String label;
  final VoidCallback? onTap;
}

/// Breadcrumbs, the page title and actions in one bar. On phones the breadcrumbs become a back arrow; [onBack]
/// (since 1.7) shows a back arrow at every width. Mirrors `<cm-page-header>`.
///
/// Owner standard (1.6): title 24/32 semibold (20/28 when the screen is 640px wide or less), an optional
/// [description] line in 13/18 text-tertiary, breadcrumbs 13/18. The [adornment] (a badge) sits beside the title and
/// wraps under it only when the title runs out of room. Padding 12/24 (8/16 on phones), at least 64 tall (48).
class CmPageHeader extends StatelessWidget {
  const CmPageHeader({super.key, required this.title, this.breadcrumbs = const [], this.actions = const [], this.adornment, this.description, this.onBack, this.backLabel});
  final String title;
  final List<CmBreadcrumb> breadcrumbs;
  final List<Widget> actions;

  /// Badge or count beside the title.
  final Widget? adornment;

  /// One line under the title saying what the page is for, 13px in text-tertiary. Since 1.6.
  ///
  /// On a record page it is the record's meta line ("Owner Ravi Kumar · Created 12 Nov 2026"). With a description,
  /// phones (640 or less) give the title block the whole row and put the actions under it (web 1.7).
  final String? description;

  /// Goes back to the page this one was opened from (the list of leads, of orders): shows a back arrow before the
  /// title at every width, named "Back to [backLabel]" ("Back" without a label). Use it on record pages opened from a
  /// list. Without it the arrow shows only on phones, for the last breadcrumb. Mirrors `back-href`. Since 1.7.
  final VoidCallback? onBack;

  /// Name of the page [onBack] leads to ("Leads"), for the back arrow's accessible name. Since 1.7.
  final String? backLabel;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final phone = CmBreakpoints.of(context) == CmScreen.phone || cmIsNarrow(context);
    final hasDescription = description != null && description!.isNotEmpty;
    final strings = CmStrings.of(context);
    // onBack shows the arrow at every width; otherwise phones get one for the last breadcrumb.
    final back = onBack != null
        ? (label: backLabel == null || backLabel!.isEmpty ? strings.back : strings.backTo(backLabel!), onTap: onBack)
        : phone && breadcrumbs.isNotEmpty
            ? (label: strings.backTo(breadcrumbs.last.label), onTap: breadcrumbs.last.onTap)
            : null;
    final titleStyle = (cmIsNarrow(context) ? CmTypeResponsive.headingLg : CmType.headingLg).copyWith(color: c.textDefault);
    final titleRow = Wrap(spacing: CmSpace.s8, runSpacing: CmSpace.s4, crossAxisAlignment: WrapCrossAlignment.center, children: [
      Semantics(header: true, child: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: titleStyle)),
      ?adornment,
    ]);
    return Container(
      width: double.infinity,
      constraints: BoxConstraints(minHeight: phone ? 48 : 64),
      padding: EdgeInsets.symmetric(horizontal: phone ? CmSpace.s16 : CmSpace.s24, vertical: phone ? CmSpace.s8 : CmSpace.s12),
      decoration: BoxDecoration(color: c.bgSurface, border: Border(bottom: BorderSide(color: c.borderSubtle))),
      // Title and actions share one row while the title keeps about 280px (160 on phones); otherwise the actions
      // wrap below it, and badges wrap under the title rather than squeeze it (web: cm-page-header, 1.2).
      child: CmHeaderWrap(
        // With a description (a record's meta line) phones put the actions under the title block (web 1.7).
        minLeadWidth: phone ? (hasDescription ? double.infinity : 160) : 280,
        gap: phone ? CmSpace.s8 : CmSpace.s20,
        runGap: phone ? CmSpace.s8 : CmSpace.s12,
        center: true,
        trailingAtEnd: true,
        lead: Row(children: [
          if (back != null)
            Semantics(
              button: true,
              label: back.label,
              excludeSemantics: true, onTap: back.onTap,
              child: InkWell(
                onTap: back.onTap,
                borderRadius: BorderRadius.circular(CmRadius.sm),
                child: SizedBox.square(
                  dimension: cmButtonHeight(context, CmControlHeight.md),
                  child: Center(child: Transform.flip(flipX: Directionality.of(context) == TextDirection.rtl, child: CmIcon(CmIcons.chevronLeft, size: CmIconSize.md, color: c.iconSelected))),
                ),
              ),
            ),
          if (back != null) const SizedBox(width: CmSpace.s8),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
              if (!phone && breadcrumbs.isNotEmpty)
                Semantics(
                  container: true,
                  label: CmStrings.of(context).breadcrumb,
                  child: Wrap(children: [
                    for (final b in breadcrumbs) ...[
                      InkWell(onTap: b.onTap, child: Text(b.label, style: CmType.bodySm.copyWith(color: c.textTertiary))),
                      Text(' / ', style: CmType.bodySm.copyWith(color: c.textTertiary)),
                    ],
                    Text(title, style: CmType.bodySm.copyWith(color: c.textDefault)),
                  ]),
                ),
              if (!phone && breadcrumbs.isNotEmpty) const SizedBox(height: CmSpace.s4),
              titleRow,
              if (hasDescription)
                Padding(padding: const EdgeInsets.only(top: CmSpace.s4), child: Text(description!, style: CmType.bodySm.copyWith(color: c.textTertiary))),
            ]),
          ),
        ]),
        trailing: actions.isEmpty ? const SizedBox.shrink() : Wrap(alignment: WrapAlignment.end, spacing: CmSpace.s8, runSpacing: CmSpace.s8, crossAxisAlignment: WrapCrossAlignment.center, children: actions),
      ),
    );
  }
}

/// A bar with a message, Discard and Save, shown while there are unsaved changes. Mirrors `<cm-save-bar>`.
class CmSaveBar extends StatelessWidget {
  const CmSaveBar({super.key, required this.visible, required this.onSave, required this.onDiscard, this.message = 'Unsaved changes', this.saving = false});
  final bool visible, saving;
  final VoidCallback onSave, onDiscard;
  final String message;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    return AnimatedSwitcher(
      duration: cmDuration(context, CmMotion.base),
      switchInCurve: CmMotion.standard,
      child: !visible
          ? const SizedBox.shrink()
          : Semantics(
              container: true,
              liveRegion: true,
              label: message,
              child: Container(
                key: const ValueKey('bar'),
                padding: const EdgeInsets.symmetric(horizontal: CmSpace.s20, vertical: 12),
                decoration: BoxDecoration(color: c.bgSurface, border: Border(top: BorderSide(color: c.borderSubtle)), boxShadow: CmShadow.lg),
                child: Row(children: [
                  Expanded(child: Text(message, style: CmType.bodyLg.copyWith(color: c.textDefault))),
                  CmButton(label: CmStrings.of(context).saveBarDiscard, size: CmButtonSize.large, onPressed: saving ? null : onDiscard),
                  const SizedBox(width: CmSpace.s8),
                  CmButton(label: CmStrings.of(context).saveBarSave, size: CmButtonSize.large, variant: CmButtonVariant.primary, loading: saving, onPressed: onSave),
                ]),
              ),
            ),
    );
  }
}

/// Says what is missing and gives the one action that fills it. Mirrors `<cm-empty-state>`.
///
/// Owner standard (1.6): by default a 48px tile with a 24px icon, a 16/24 heading, 13/18 text and the action (a
/// 36px [CmButton]), 12/4/12px apart. [large] keeps the big 160px illustration circle of earlier versions (120 on
/// phones); [small] the 120px circle.
///
/// [inline] (since 1.2) is the compact form for an empty list inside a card, panel or table: one or two
/// start-aligned lines with a 20px [icon] (pass `icon: ''` for text only), the heading, the [message] after it,
/// and an optional text action ([actionLabel], [onAction]). No circle, no extra height.
class CmEmptyState extends StatelessWidget {
  const CmEmptyState({
    super.key,
    required this.heading,
    this.message,
    this.icon = CmIcons.box,
    this.action,
    this.small = false,
    this.inline = false,
    this.large = false,
    this.actionLabel,
    this.onAction,
  });
  final String heading;
  final String? message;

  /// Icon from [CmIcons]. Inline: an empty string shows no icon.
  final String icon;

  /// The primary action, usually one primary [CmButton].
  final Widget? action;

  /// The 120px illustration circle (1.0-1.5 look, smaller).
  final bool small;

  /// The 160px illustration circle of 1.0-1.5 (120 on phones), for a whole empty page. Since 1.6.
  final bool large;

  /// The compact one- or two-line form. Since 1.2.
  final bool inline;

  /// Text of one action drawn as an underlined text button ("Add task", "View all"), after the text. Meant for
  /// [inline]; larger sizes usually take a [CmButton] in [action]. Since 1.2.
  final String? actionLabel;

  /// Called by the text action.
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final textAction = actionLabel == null ? null : _TextAction(label: actionLabel!, onTap: onAction);
    if (inline) {
      final base = CmType.bodyMd.copyWith(height: 20 / 14);
      // One run of text, like the web's inline layout: the heading (a heading for screen readers), the message,
      // then the actions, wrapping onto a second line when needed.
      return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        if (icon.isNotEmpty) ...[ExcludeSemantics(child: CmIcon(icon, size: 20, color: c.iconDefault)), const SizedBox(width: CmSpace.s8)],
        Flexible(
          child: Semantics(
            container: true,
            explicitChildNodes: true,
            child: Text.rich(TextSpan(style: base.copyWith(color: c.textTertiary), children: [
              WidgetSpan(
                alignment: PlaceholderAlignment.baseline,
                baseline: TextBaseline.alphabetic,
                child: Semantics(container: true, header: true, child: Text(heading, style: base.copyWith(fontWeight: FontWeight.w500, color: c.textDefault))),
              ),
              if (message != null) TextSpan(text: ' $message'),
              if (textAction != null)
                WidgetSpan(alignment: PlaceholderAlignment.middle, child: Semantics(container: true, child: Padding(padding: const EdgeInsetsDirectional.only(start: CmSpace.s8), child: textAction))),
              if (action != null)
                WidgetSpan(alignment: PlaceholderAlignment.middle, child: Semantics(container: true, child: Padding(padding: const EdgeInsetsDirectional.only(start: CmSpace.s8), child: action))),
            ])),
          ),
        ),
      ]);
    }
    final iconName = icon.isEmpty ? CmIcons.box : icon;
    if (!small && !large) {
      // The compact default (1.6): a 48px tile, 12 to a 16/24 heading, 4 to 13/18 text, 12 to the actions.
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: CmSpace.s32, horizontal: CmSpace.s16),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          ExcludeSemantics(
            child: Container(
              width: 48, height: 48,
              decoration: BoxDecoration(color: c.bgTag, borderRadius: BorderRadius.circular(CmRadius.md)),
              alignment: Alignment.center,
              child: CmIcon(iconName, size: CmIconSize.lg, color: c.iconSelected),
            ),
          ),
          const SizedBox(height: CmSpace.s12),
          Semantics(header: true, child: Text(heading, textAlign: TextAlign.center, style: CmType.headingSm.copyWith(color: c.textDefault))),
          if (message != null)
            Padding(
              padding: const EdgeInsets.only(top: CmSpace.s4),
              // About 46 characters wide, like the web's max-width: 46ch.
              child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 360), child: Text(message!, textAlign: TextAlign.center, style: CmType.bodySm.copyWith(color: c.textTertiary))),
            ),
          if (action != null || textAction != null)
            Padding(
              padding: const EdgeInsets.only(top: CmSpace.s12),
              child: Wrap(alignment: WrapAlignment.center, spacing: CmSpace.s8, runSpacing: CmSpace.s8, children: [?action, ?textAction]),
            ),
        ]),
      );
    }
    final d = small ? 120.0 : (cmIsNarrow(context) ? 120.0 : 160.0);
    return Padding(
      padding: EdgeInsets.symmetric(vertical: small ? CmSpace.s24 : CmSpace.s32, horizontal: small ? CmSpace.s16 : CmSpace.s20),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        ExcludeSemantics(child: Container(width: d, height: d, decoration: BoxDecoration(color: c.bgInputFilled, shape: BoxShape.circle), alignment: Alignment.center, child: CmIcon(iconName, size: d / 3, color: c.iconDefault))),
        SizedBox(height: large && !cmIsNarrow(context) ? CmSpace.s24 : CmSpace.s16),
        Semantics(header: true, child: Text(heading, textAlign: TextAlign.center, style: (small ? CmType.bodyMd.copyWith(fontWeight: FontWeight.w600) : CmType.headingSm).copyWith(color: c.textDefault))),
        if (message != null) Padding(padding: const EdgeInsets.only(top: CmSpace.s4), child: Text(message!, textAlign: TextAlign.center, style: (large ? CmType.bodyMd : CmType.bodySm).copyWith(color: c.textTertiary))),
        if (action != null || textAction != null)
          Padding(
            padding: EdgeInsets.only(top: large ? CmSpace.s16 : CmSpace.s12),
            child: Wrap(alignment: WrapAlignment.center, spacing: CmSpace.s8, runSpacing: CmSpace.s8, children: [?action, ?textAction]),
          ),
      ]),
    );
  }
}

/// An underlined text button, the empty state's [CmEmptyState.actionLabel].
class _TextAction extends StatefulWidget {
  const _TextAction({required this.label, required this.onTap});
  final String label;
  final VoidCallback? onTap;
  @override
  State<_TextAction> createState() => _TextActionState();
}

class _TextActionState extends State<_TextAction> {
  bool _hover = false, _focus = false;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final enabled = widget.onTap != null;
    return Semantics(
      button: true,
      enabled: enabled,
      label: widget.label,
      excludeSemantics: true,
      onTap: widget.onTap,
      child: FocusableActionDetector(
        enabled: enabled,
        mouseCursor: enabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
        onShowHoverHighlight: (v) => setState(() => _hover = v),
        onShowFocusHighlight: (v) => setState(() => _focus = v),
        actions: {ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) { widget.onTap?.call(); return null; })},
        child: GestureDetector(
          onTap: widget.onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 2),
            decoration: BoxDecoration(borderRadius: BorderRadius.circular(CmRadius.xs), border: _focus ? Border.all(color: c.borderStrong, width: 2) : null),
            child: Text(widget.label,
                style: CmType.bodyMd.copyWith(height: 20 / 14, fontWeight: FontWeight.w500, color: c.textDefault, decoration: TextDecoration.underline, decorationThickness: _hover ? 2 : 1)),
          ),
        ),
      ),
    );
  }
}

/// A grey placeholder that keeps the layout while content loads. Hidden from screen readers.
/// Mirrors `<cm-skeleton>`.
class CmSkeleton extends StatefulWidget {
  const CmSkeleton({super.key, this.width = double.infinity, this.height = 16, this.radius = CmRadius.sm});
  final double width, height, radius;

  @override
  State<CmSkeleton> createState() => _CmSkeletonState();
}

class _CmSkeletonState extends State<CmSkeleton> with SingleTickerProviderStateMixin {
  late final AnimationController _a = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))..repeat(reverse: true);

  @override
  void dispose() { _a.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final still = MediaQuery.of(context).disableAnimations;
    return ExcludeSemantics(
      child: AnimatedBuilder(
        animation: _a,
        builder: (context, _) => Container(
          width: widget.width, height: widget.height,
          decoration: BoxDecoration(
            color: still ? c.bgInputFilled : Color.lerp(c.bgInputFilled, c.thumbBg, _a.value),
            borderRadius: BorderRadius.circular(widget.radius),
          ),
        ),
      ),
    );
  }
}

/// One status in [CmStatusTabs].
class CmStatusTab {
  const CmStatusTab(this.value, this.label, {this.count});
  final String value, label;
  final int? count;
}

/// [CmStatusTabs] sizes (owner standard, 1.6): [large] 14px labels for page-level statuses, [small] 13px and tighter
/// (32 tall, 16 between tabs) inside a card. Since 1.7.
enum CmStatusTabsSize { large, small }

/// How [CmStatusTabs] shows on phone widths (640 or less). Since 1.7.
enum CmStatusTabsMobile {
  /// The row scrolls sideways, with a fade at the edge that has more. The default.
  scroll,

  /// A dropdown of the same choices with their counts ("Open (12)"): one control instead of a long row.
  select,
}

/// Statuses with counts that filter a list. Mirrors `<cm-status-tabs>`.
///
/// Since 1.6 (owner standard): a 40px row of 14px labels (medium; semibold when chosen, over a 2px underline) on a
/// hairline, each count in a small neutral pill (read as "My tasks, 4"). One tab stop: arrow keys (mirrored in
/// right-to-left text) move and select, Home and End jump to the ends. Too many tabs for the width scroll sideways,
/// and the edge with more tabs past it fades out over 32px so a cut-off row reads as one that scrolls.
/// [size] small (13px, 32 tall) suits a card; [mobile] select shows a dropdown on phone widths instead (since 1.7).
class CmStatusTabs extends StatefulWidget {
  const CmStatusTabs({
    super.key,
    required this.tabs,
    required this.value,
    required this.onChanged,
    this.semanticLabel,
    this.size = CmStatusTabsSize.large,
    this.mobile = CmStatusTabsMobile.scroll,
  });
  final List<CmStatusTab> tabs;
  final String value;
  final ValueChanged<String> onChanged;

  /// Label size and row height. Since 1.7.
  final CmStatusTabsSize size;

  /// The layout on phone widths: a scrolling row, or a dropdown. Since 1.7.
  final CmStatusTabsMobile mobile;

  /// Accessible name of the tab list. Default [CmStrings.statusTabs].
  final String? semanticLabel;

  @override
  State<CmStatusTabs> createState() => _CmStatusTabsState();
}

class _CmStatusTabsState extends State<CmStatusTabs> {
  final _scroll = ScrollController();
  final List<FocusNode> _nodes = [];
  final List<GlobalKey> _keys = [];
  // Keeps the scroll view (and its offset) when the edge fade wraps it in a ShaderMask.
  final _stripKey = GlobalKey();
  bool _moreStart = false, _moreEnd = false;
  int? _hover, _focused;

  @override
  void initState() {
    super.initState();
    _scroll.addListener(_measure);
    _revealSelected(animate: false);
  }

  @override
  void didUpdateWidget(CmStatusTabs old) {
    super.didUpdateWidget(old);
    if (old.value != widget.value) _revealSelected(animate: true);
  }

  @override
  void dispose() {
    _scroll.dispose();
    for (final n in _nodes) {
      n.dispose();
    }
    super.dispose();
  }

  void _sync() {
    while (_nodes.length < widget.tabs.length) {
      _nodes.add(FocusNode(debugLabel: 'CmStatusTabs tab ${_nodes.length}'));
      _keys.add(GlobalKey());
    }
    while (_nodes.length > widget.tabs.length) {
      _nodes.removeLast().dispose();
      _keys.removeLast();
    }
  }

  void _measure() {
    if (!_scroll.hasClients) return;
    final p = _scroll.position;
    final start = p.pixels > 0.5, end = p.pixels < p.maxScrollExtent - 0.5;
    if (start != _moreStart || end != _moreEnd) setState(() { _moreStart = start; _moreEnd = end; });
  }

  void _select(int i) {
    _nodes[i].requestFocus();
    final ctx = _keys[i].currentContext;
    if (ctx != null) Scrollable.ensureVisible(ctx, duration: cmDuration(context, CmMotion.base), curve: CmMotion.standard, alignment: 0.5);
    if (widget.tabs[i].value != widget.value) widget.onChanged(widget.tabs[i].value);
  }

  /// Scrolls the selected tab into view when it is cut off, without moving focus: on the first frame (at once)
  /// and when the parent changes [CmStatusTabs.value]. Matches the web tabs' scrollIntoView (inline nearest).
  void _revealSelected({required bool animate}) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || !_scroll.hasClients) return;
      final sel = widget.tabs.indexWhere((t) => t.value == widget.value);
      if (sel < 0 || sel >= _keys.length) return;
      final ctx = _keys[sel].currentContext;
      final box = ctx?.findRenderObject() as RenderBox?;
      final view = _scroll.position.context.notificationContext?.findRenderObject() as RenderBox?;
      if (ctx == null || box == null || view == null || !box.hasSize || !view.hasSize) return;
      final left = box.localToGlobal(Offset.zero, ancestor: view).dx;
      if (left >= -0.5 && left + box.size.width <= view.size.width + 0.5) return;
      Scrollable.ensureVisible(ctx, alignment: 0.5, duration: animate ? cmDuration(context, CmMotion.base) : Duration.zero, curve: CmMotion.standard);
    });
  }

  /// The width of [label] in semibold, so every label can reserve the room the selected weight needs.
  double _semiboldWidth(BuildContext context, String label, TextStyle style) {
    final p = TextPainter(
      text: TextSpan(text: label, style: DefaultTextStyle.of(context).style.merge(style.copyWith(fontWeight: FontWeight.w600))),
      textDirection: Directionality.of(context),
      textScaler: MediaQuery.textScalerOf(context),
      maxLines: 1,
    )..layout();
    final w = p.width;
    p.dispose();
    return w;
  }

  KeyEventResult _onKey(int i, KeyEvent e) {
    if (e is! KeyDownEvent && e is! KeyRepeatEvent) return KeyEventResult.ignored;
    final k = e.logicalKey;
    final n = widget.tabs.length;
    final rtl = Directionality.of(context) == TextDirection.rtl;
    int? next;
    if (k == LogicalKeyboardKey.arrowRight) {
      next = rtl ? (i - 1 + n) % n : (i + 1) % n;
    } else if (k == LogicalKeyboardKey.arrowLeft) {
      next = rtl ? (i + 1) % n : (i - 1 + n) % n;
    } else if (k == LogicalKeyboardKey.home) {
      next = 0;
    } else if (k == LogicalKeyboardKey.end) {
      next = n - 1;
    } else if (k == LogicalKeyboardKey.enter || k == LogicalKeyboardKey.space) {
      next = i;
    }
    if (next == null) return KeyEventResult.ignored;
    _select(next);
    return KeyEventResult.handled;
  }

  @override
  Widget build(BuildContext context) {
    _sync();
    final c = CmTheme.colorsOf(context);
    final s = CmStrings.of(context);
    final narrow = cmIsNarrow(context);
    final tabs = widget.tabs;
    final sel = tabs.indexWhere((t) => t.value == widget.value);
    final stop = sel >= 0 ? sel : 0;
    if (narrow && widget.mobile == CmStatusTabsMobile.select) return _dropdown(context, sel);
    final small = widget.size == CmStatusTabsSize.small;
    final labelStyle = small ? CmType.bodySm.copyWith(fontSize: 13, height: 18 / 13) : CmType.bodyMd;
    WidgetsBinding.instance.addPostFrameCallback((_) { if (mounted) _measure(); });
    final row = Row(mainAxisSize: MainAxisSize.min, children: [
      for (var i = 0; i < tabs.length; i++) ...[
        if (i > 0) SizedBox(width: narrow || small ? CmSpace.s16 : CmSpace.s24),
        Builder(key: _keys[i], builder: (context) {
          final t = tabs[i];
          final on = i == sel;
          final fg = on || _hover == i ? c.textDefault : c.textTertiary;
          final label = Text(t.label, style: labelStyle.copyWith(fontWeight: on ? FontWeight.w600 : FontWeight.w500, color: fg));
          return Semantics(
            selected: on,
            button: true,
            label: t.count == null ? t.label : '${t.label}, ${CmStrings.groupDigits(t.count!)}',
            excludeSemantics: true,
            onTap: () => _select(i),
            child: Focus(
              focusNode: _nodes[i],
              skipTraversal: i != stop,
              onKeyEvent: (_, e) => _onKey(i, e),
              onFocusChange: (f) => setState(() => _focused = f ? i : (_focused == i ? null : _focused)),
              child: MouseRegion(
                cursor: SystemMouseCursors.click,
                onEnter: (_) => setState(() => _hover = i),
                onExit: (_) => setState(() => _hover = null),
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => _select(i),
                  child: Container(
                    constraints: BoxConstraints(minHeight: cmControlHeight(context, small ? CmControlHeight.sm : CmControlHeight.lg)),
                    decoration: BoxDecoration(
                      border: Border(bottom: BorderSide(color: on ? c.borderStrong : Colors.transparent, width: 2)),
                    ),
                    foregroundDecoration: _focused == i
                        ? BoxDecoration(border: Border.all(color: c.borderStrong, width: 2), borderRadius: BorderRadius.circular(CmRadius.xs))
                        : null,
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      // The chosen tab's semibold label takes no extra room: each label reserves its semibold width,
                      // measured rather than drawn so the label is a single Text in the tree.
                      ConstrainedBox(
                        constraints: BoxConstraints(minWidth: _semiboldWidth(context, t.label, labelStyle)),
                        child: Align(alignment: AlignmentDirectional.centerStart, widthFactor: 1, heightFactor: 1, child: label),
                      ),
                      if (t.count != null) ...[
                        SizedBox(width: small ? CmSpace.s4 : CmSpace.s8),
                        Container(
                          constraints: const BoxConstraints(minWidth: CmSpace.s20),
                          height: CmSpace.s20,
                          padding: const EdgeInsets.symmetric(horizontal: CmSpace.s4),
                          decoration: BoxDecoration(color: c.bgTag, borderRadius: BorderRadius.circular(CmRadius.full)),
                          child: Center(
                            widthFactor: 1,
                            child: Text(CmStrings.groupDigits(t.count!), style: CmType.bodyXs.copyWith(height: 1, fontWeight: FontWeight.w500, color: c.textDefault, fontFeatures: const [FontFeature.tabularFigures()])),
                          ),
                        ),
                      ],
                    ]),
                  ),
                ),
              ),
            ),
          );
        }),
      ],
    ]);
    Widget strip = SingleChildScrollView(key: _stripKey, controller: _scroll, scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 2), child: row);
    if (_moreStart || _moreEnd) {
      // The fade is a mask of opacity, not a colour, so it works on any background and theme.
      final rtl = Directionality.of(context) == TextDirection.rtl;
      final fadeLeft = rtl ? _moreEnd : _moreStart, fadeRight = rtl ? _moreStart : _moreEnd;
      strip = ShaderMask(
        blendMode: BlendMode.dstIn,
        shaderCallback: (r) {
          final f = r.width <= 0 ? 0.0 : (CmSpace.s32 / r.width).clamp(0.0, 0.5);
          return LinearGradient(
            colors: [if (fadeLeft) Colors.transparent, Colors.black, Colors.black, if (fadeRight) Colors.transparent],
            stops: [if (fadeLeft) 0, fadeLeft ? f : 0, fadeRight ? 1 - f : 1, if (fadeRight) 1],
          ).createShader(r);
        },
        child: strip,
      );
    }
    return Semantics(
      container: true,
      explicitChildNodes: true,
      label: widget.semanticLabel ?? s.statusTabs,
      child: DecoratedBox(
        // The hairline under the whole row.
        decoration: BoxDecoration(border: Border(bottom: BorderSide(color: c.borderSubtle))),
        child: strip,
      ),
    );
  }

  /// The dropdown shown instead of the tabs on phone widths with [CmStatusTabsMobile.select].
  Widget _dropdown(BuildContext context, int sel) {
    final c = CmTheme.colorsOf(context);
    final s = CmStrings.of(context);
    final touch = cmIsTouch(context);
    final h = cmFieldHeight(context);
    final style = CmType.bodyMd.copyWith(fontSize: touch ? 16 : 14, fontWeight: FontWeight.w500, color: c.textDefault);
    String text(CmStatusTab t) => t.count == null ? t.label : s.statusTabsOption(t.label, t.count!);
    return Semantics(
      label: widget.semanticLabel ?? s.statusTabs,
      child: DropdownButtonFormField<String>(
        value: sel >= 0 ? widget.tabs[sel].value : null,
        items: [for (final t in widget.tabs) DropdownMenuItem(value: t.value, child: Text(text(t), overflow: TextOverflow.ellipsis, style: style))],
        onChanged: (v) {
          if (v != null && v != widget.value) widget.onChanged(v);
        },
        icon: CmIcon(CmIcons.chevronDown, size: 16, color: c.iconSelected),
        isExpanded: true,
        dropdownColor: c.bgSurface,
        borderRadius: BorderRadius.circular(CmRadius.sm),
        decoration: InputDecoration(
          isDense: true,
          constraints: BoxConstraints(minHeight: h),
          contentPadding: EdgeInsets.symmetric(horizontal: CmSpace.s12, vertical: (h - 24) / 2),
        ),
      ),
    );
  }
}

/// "Showing 21–40 of 290" with previous and next. Mirrors `<cm-pagination>`.
class CmPagination extends StatelessWidget {
  const CmPagination({super.key, required this.page, required this.pageSize, required this.total, required this.onPageChanged, this.resourceName = 'items'});
  final int page, pageSize, total;
  final ValueChanged<int> onPageChanged;
  final String resourceName;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final pages = (total / pageSize).ceil().clamp(1, 1 << 30);
    final from = total == 0 ? 0 : (page - 1) * pageSize + 1;
    final to = (page * pageSize).clamp(0, total);
    Widget arrow(String icon, String label, bool enabled, int target) => Semantics(
          button: true, enabled: enabled, label: label, excludeSemantics: true, onTap: enabled ? () => onPageChanged(target) : null,
          child: InkWell(
            onTap: enabled ? () => onPageChanged(target) : null,
            child: Container(
              width: 32, height: 32,
              decoration: BoxDecoration(border: Border.all(color: c.borderSubtle), borderRadius: BorderRadius.circular(CmRadius.sm), color: c.bgHover),
              child: Center(child: CmIcon(icon, size: 16, color: enabled ? c.textDefault : c.textSecondary)),
            ),
          ),
        );
    return Container(
      constraints: const BoxConstraints(minHeight: 48),
      padding: const EdgeInsets.symmetric(horizontal: CmSpace.s16),
      child: Row(children: [
        Expanded(child: Semantics(liveRegion: true, child: Text(CmStrings.of(context).paginationSummary(from, to, total, resourceName), style: CmType.bodySm.copyWith(color: c.textDefault)))),
        Text(CmStrings.of(context).paginationPage(page, pages), style: CmType.bodySm.copyWith(color: c.textDefault)),
        const SizedBox(width: CmSpace.s8),
        arrow(CmIcons.chevronLeft, CmStrings.of(context).previousPage, page > 1, page - 1),
        const SizedBox(width: CmSpace.s8),
        arrow(CmIcons.chevronRight, CmStrings.of(context).nextPage, page < pages, page + 1),
      ]),
    );
  }
}

/// A row in a [CmResourceList].
class CmResourceItem {
  const CmResourceItem({required this.id, required this.child, this.semanticLabel, this.onTap, this.media, this.actions = const []});
  final String id;
  final Widget child;

  /// Accessible name for the row (e.g. "Order #1042").
  final String? semanticLabel;
  final VoidCallback? onTap;

  /// A thumbnail: 40px (32 in compact rows and on phones).
  final Widget? media;

  /// Buttons at the end of the row. They do not toggle selection. On phones (640px or less), when the content would
  /// get narrower than 192px beside them, they wrap onto a line of their own under the content, at the start. Since 1.6.
  final List<Widget> actions;
}

/// Selectable rows with bulk actions once something is selected. Mirrors `<cm-resource-list>`.
///
/// Since 1.6 (owner standard): rows are 56 tall with a 40px thumbnail ([CmDensity.compact]: 40 tall, 32px
/// thumbnail; at least 44 on touch screens), 14px text, a hairline between rows. A slim select-all row (40 tall, 13px)
/// sits above them with its box lined up with the rows' boxes; once something is selected it shows the count and the
/// [bulkActions].
class CmResourceList extends StatelessWidget {
  const CmResourceList({
    super.key,
    required this.items,
    this.selected = const {},
    this.onSelectionChanged,
    this.bulkActions = const [],
    this.resourceName = 'item',
    this.empty,
    this.loading = false,
    this.density = CmDensity.comfortable,
  });
  final List<CmResourceItem> items;
  final Set<String> selected;

  /// Makes rows selectable when set.
  final ValueChanged<Set<String>>? onSelectionChanged;
  final List<Widget> bulkActions;
  final String resourceName;

  /// Shown when there are no items (e.g. a [CmEmptyState]).
  final Widget? empty;
  final bool loading;

  /// Row height: comfortable 56, compact 40. Since 1.6.
  final CmDensity density;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final s = CmStrings.of(context);
    final narrow = cmIsNarrow(context);
    final compact = density == CmDensity.compact;
    final selectable = onSelectionChanged != null;
    final rowH = compact ? 40.0 : 56.0;
    final rowPad = compact ? CmSpace.s4 : CmSpace.s8;
    final media = compact || narrow ? 32.0 : 40.0;
    // Rows run edge to edge (1.17.1, owner rule: a hover or selected row is highlighted across the full width) and
    // pad 12 + 8 inside (12 on phones), so their box starts 20 from the edge (12 on phones). The select-all row
    // puts its box at the same place.
    const listPad = CmSpace.s12;
    final inner = narrow ? 0.0 : CmSpace.s8;
    final gap = narrow ? CmSpace.s8 : CmSpace.s12;
    final all = items.isNotEmpty && selected.length == items.length;
    final some = selected.isNotEmpty && !all;
    void toggle(String id, bool on) => onSelectionChanged!(on ? {...selected, id} : ({...selected}..remove(id)));

    Widget row(CmResourceItem i, bool last) {
      final isSel = selected.contains(i.id);
      final body = DefaultTextStyle.merge(style: CmType.bodyMd.copyWith(color: c.textDefault), child: i.child);
      final lead = <Widget>[
        if (selectable) ...[
          CmRowCheck(value: isSel, onChanged: (v) => toggle(i.id, v == true), semanticLabel: s.selectItem(i.semanticLabel ?? i.id)),
          SizedBox(width: gap),
        ],
        if (i.media != null) ...[SizedBox.square(dimension: media, child: ClipRRect(borderRadius: BorderRadius.circular(CmRadius.sm), child: i.media)), SizedBox(width: gap)],
      ];
      final actions = i.actions.isEmpty ? null : Wrap(spacing: CmSpace.s8, runSpacing: CmSpace.s8, crossAxisAlignment: WrapCrossAlignment.center, children: i.actions);
      // Wrapping actions (#31): on phones, when the content would get less than 192px beside the buttons, they go
      // to a line of their own under it, at the start.
      final Widget line = Row(children: [
        ...lead,
        Expanded(
          child: actions == null
              ? body
              : CmHeaderWrap(lead: body, trailing: actions, minLeadWidth: narrow ? 192 : 0, gap: gap, runGap: CmSpace.s8, center: true),
        ),
      ]);
      final Widget Function({required Widget child}) wrap = i.actions.isEmpty
          ? MergeSemantics.new
          // Rows with actions keep the buttons as separate nodes.
          : ({required Widget child}) => Semantics(container: true, child: child);
      return wrap(
        child: Material(
          color: isSel ? c.bgHover : c.bgSurface,
          child: InkWell(
            onTap: i.onTap ?? (selectable ? () => toggle(i.id, !isSel) : null),
            hoverColor: c.bgHover,
            child: Container(
              constraints: BoxConstraints(minHeight: cmControlHeight(context, rowH)),
              padding: EdgeInsets.symmetric(horizontal: listPad + inner, vertical: rowPad),
              decoration: BoxDecoration(border: last ? null : Border(bottom: BorderSide(color: c.borderSubtle))),
              alignment: AlignmentDirectional.centerStart,
              child: line,
            ),
          ),
        ),
      );
    }

    final rows = loading
        ? List.generate(3, (_) => SizedBox(height: rowH, child: Padding(padding: EdgeInsets.symmetric(horizontal: listPad + inner, vertical: rowPad + 8), child: const CmSkeleton(height: 16))))
        : [for (var k = 0; k < items.length; k++) row(items[k], k == items.length - 1)];

    final toolbar = selectable && items.isNotEmpty
        ? Container(
            constraints: BoxConstraints(minHeight: cmControlHeight(context, CmControlHeight.lg)),
            padding: EdgeInsetsDirectional.only(start: listPad + inner, end: listPad),
            decoration: BoxDecoration(color: c.bgHover, border: Border.symmetric(horizontal: BorderSide(color: c.borderSubtle))),
            alignment: AlignmentDirectional.centerStart,
            child: Wrap(spacing: CmSpace.s8, runSpacing: CmSpace.s4, crossAxisAlignment: WrapCrossAlignment.center, children: [
              MergeSemantics(
                child: InkWell(
                  onTap: () => onSelectionChanged!(all ? {} : items.map((e) => e.id).toSet()),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    CmRowCheck(
                      value: all ? true : (some ? null : false),
                      tristate: true,
                      onChanged: (_) => onSelectionChanged!(all || some ? {} : items.map((e) => e.id).toSet()),
                      semanticLabel: all ? s.deselectAll : s.selectAll,
                    ),
                    SizedBox(width: gap),
                    if (selected.isEmpty) Text(s.selectAll, style: CmType.bodySm.copyWith(fontWeight: FontWeight.w500, color: c.textDefault)),
                  ]),
                ),
              ),
              if (selected.isNotEmpty) ...[
                Semantics(
                  liveRegion: true,
                  child: Text(s.itemsSelected(selected.length, resourceName), style: CmType.bodySm.copyWith(fontWeight: FontWeight.w500, color: c.textDefault, fontFeatures: const [FontFeature.tabularFigures()])),
                ),
                ...bulkActions,
              ],
            ]),
          )
        : null;

    return Container(
      decoration: BoxDecoration(color: c.bgSurface, border: Border.all(color: c.borderSubtle), borderRadius: BorderRadius.circular(CmRadius.md)),
      clipBehavior: Clip.antiAlias,
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        ?toolbar,
        if (!loading && items.isEmpty && empty != null)
          empty!
        else
          Padding(padding: const EdgeInsets.only(bottom: CmSpace.s8), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: rows)),
      ]),
    );
  }
}
