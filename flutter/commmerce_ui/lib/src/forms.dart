import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'display.dart' show CmTone;
import 'generated/icons.g.dart';
import 'generated/tokens.g.dart';
import 'icon.dart';
import 'strings.dart';
import 'theme.dart';

/// Label row shared by form fields: label, red asterisk when required, bracketed lowercase hint.
class _FieldLabel extends StatelessWidget {
  const _FieldLabel({required this.label, this.hint, this.required = false, this.small = false});
  final String label;
  final String? hint;
  final bool required, small;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final t = CmText.of(context);
    return Text.rich(TextSpan(children: [
      TextSpan(text: label, style: (small ? t.bodySm : t.label).copyWith(color: c.textDefault)),
      if (required) TextSpan(text: ' *', style: TextStyle(color: c.textCritical), semanticsLabel: CmStrings.of(context).requiredSuffix),
      if (hint != null && hint!.isNotEmpty)
        TextSpan(text: '  [${hint!.toLowerCase()}]', style: CmType.bodyXs.copyWith(color: c.textTertiary)),
    ]));
  }
}

/// Labelled single- or multi-line input. Mirrors `<cm-text-field>`.
///
/// Owner standard (1.6): the field is 40 tall ([small]: 32, for filter rows and toolbars; 44 on touch screens), the
/// label 13/18 medium, help and error text 12/16.
class CmTextField extends StatelessWidget {
  const CmTextField({
    super.key,
    required this.label,
    this.controller,
    this.initialValue,
    this.onChanged,
    this.hint,
    this.helpText,
    this.error,
    this.placeholder,
    this.required = false,
    this.readOnly = false,
    this.enabled = true,
    this.multiline = false,
    this.rows = 4,
    this.small = false,
    this.keyboardType,
    this.autofillHints,
    this.validator,
  });

  final String label;
  final TextEditingController? controller;
  final String? initialValue;
  final ValueChanged<String>? onChanged;

  /// Lowercase bracketed note after the label, e.g. "points earned per rupee spent".
  final String? hint;

  /// One sentence under the field.
  final String? helpText;

  /// Error message: the border turns critical and screen readers announce it.
  final String? error;
  final String? placeholder;
  final bool required, readOnly, enabled, multiline, small;
  final int rows;
  final TextInputType? keyboardType;
  final Iterable<String>? autofillHints;

  /// Use inside a [Form] for validation on save.
  final FormFieldValidator<String>? validator;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final hasError = error != null && error!.isNotEmpty;
    final h = cmFieldHeight(context, small: small);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
      _FieldLabel(label: label, hint: hint, required: required, small: small),
      SizedBox(height: small ? CmSpace.s4 : CmSpace.s8),
      TextFormField(
        controller: controller,
        initialValue: controller == null ? initialValue : null,
        onChanged: onChanged,
        validator: validator,
        readOnly: readOnly,
        enabled: enabled,
        minLines: multiline ? rows : 1,
        maxLines: multiline ? rows : 1,
        keyboardType: multiline ? TextInputType.multiline : keyboardType,
        autofillHints: autofillHints,
        style: cmFieldText(context).copyWith(color: enabled ? c.textDefault : c.textSecondary),
        decoration: InputDecoration(
          hintText: placeholder,
          isDense: true,
          constraints: multiline ? null : BoxConstraints(minHeight: h),
          contentPadding: multiline ? null : cmFieldPadding(h, horizontal: small ? CmSpace.s8 : CmSpace.s12),
          fillColor: readOnly || !enabled ? c.bgInputFilled : c.bgSurface,
          errorText: hasError ? error : null,
          errorStyle: CmType.bodyXs.copyWith(color: c.textCritical),
          helperText: hasError ? null : helpText,
          helperStyle: CmType.bodyXs.copyWith(color: c.textTertiary),
          helperMaxLines: 3,
          errorMaxLines: 3,
        ),
      ),
    ]);
  }
}

/// A 16px checkbox (18 on touch screens; owner standard, 1.6), centred on the first line of its label, with an
/// optional description in 12/16 supporting text. Mirrors `<cm-checkbox>`.
class CmCheckbox extends StatelessWidget {
  const CmCheckbox({super.key, required this.label, required this.value, required this.onChanged, this.description, this.tristate = false});

  final String label;

  /// `null` shows the mixed state (with [tristate]).
  final bool? value;

  /// Null disables the checkbox.
  final ValueChanged<bool?>? onChanged;
  final String? description;
  final bool tristate;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final enabled = onChanged != null;
    void toggle() => onChanged?.call(tristate && value == true ? null : !(value ?? false));
    // Material draws an 18px box: scaled to 16 on desktops. The label's first line is 20 tall.
    final box = cmIsTouch(context) ? 18.0 : 16.0;
    return MergeSemantics(
      child: InkWell(
        onTap: enabled ? toggle : null,
        borderRadius: BorderRadius.circular(CmRadius.xs),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
          Padding(
            padding: EdgeInsets.only(top: (20 - box) / 2),
            child: SizedBox.square(
              dimension: box,
              child: Transform.scale(
                scale: box / 18,
                child: Checkbox(
                  value: value,
                  tristate: tristate,
                  onChanged: onChanged,
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  visualDensity: VisualDensity.compact,
                  side: BorderSide(color: enabled ? c.borderStrong : c.borderSubtle),
                  fillColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.disabled) ? c.bgInputFilled : c.bgSurface),
                  checkColor: c.textDefault,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(CmRadius.xs)),
                ),
              ),
            ),
          ),
          const SizedBox(width: CmSpace.s8),
          Flexible(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
              Text(label, style: CmText.of(context).bodyMd.copyWith(color: enabled ? c.textDefault : c.textSecondary)),
              if (description != null)
                Padding(padding: const EdgeInsets.only(top: 2), child: Text(description!, style: CmType.bodyXs.copyWith(color: c.textTertiary))),
            ]),
          ),
        ]),
      ),
    );
  }
}

/// One option in a [CmRadioGroup].
class CmRadioOption<T> {
  const CmRadioOption({required this.value, required this.label, this.description, this.enabled = true, this.tone});
  final T value;
  final String label;
  final String? description;
  final bool enabled;

  /// In a [CmOptionGroup], colours the option by the outcome it records: [CmTone.success] ("Signed up") or
  /// [CmTone.critical] ("Not interested"); other tones are ignored. The label still carries the meaning. Since 1.3.
  final CmTone? tone;
}

/// A group of radio buttons with an optional heading. Mirrors `<cm-radio-group>`.
class CmRadioGroup<T> extends StatelessWidget {
  const CmRadioGroup({super.key, required this.options, required this.value, required this.onChanged, this.label, this.direction = Axis.vertical});

  final List<CmRadioOption<T>> options;
  final T? value;
  final ValueChanged<T>? onChanged;
  final String? label;
  final Axis direction;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final items = options.map((o) {
      final enabled = onChanged != null && o.enabled;
      final selected = o.value == value;
      return MergeSemantics(
        child: Semantics(
          inMutuallyExclusiveGroup: true,
          checked: selected,
          child: InkWell(
            onTap: enabled ? () => onChanged!(o.value) : null,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
                Container(
                  width: 20, height: 20,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: c.bgSurface,
                    border: Border.all(color: enabled ? c.borderStrong : c.borderSubtle, width: selected ? 6 : 1),
                  ),
                ),
                const SizedBox(width: CmSpace.s8),
                Flexible(child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
                  Text(o.label, style: CmText.of(context).bodyMd.copyWith(color: enabled ? c.textDefault : c.textSecondary)),
                  if (o.description != null) Text(o.description!, style: CmType.bodyXs.copyWith(color: c.textTertiary)),
                ])),
              ]),
            ),
          ),
        ),
      );
    }).toList();
    return Semantics(
      container: true,
      label: label,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
        if (label != null) Padding(padding: const EdgeInsets.only(bottom: CmSpace.s8), child: _FieldLabel(label: label!)),
        direction == Axis.vertical
            ? Column(crossAxisAlignment: CrossAxisAlignment.start, children: _gap(items, CmSpace.s16, true))
            : Wrap(spacing: CmSpace.s32, runSpacing: CmSpace.s8, children: items),
      ]),
    );
  }
}

List<Widget> _gap(List<Widget> items, double gap, bool vertical) => [
      for (var i = 0; i < items.length; i++) ...[if (i > 0) SizedBox(height: vertical ? gap : 0, width: vertical ? 0 : gap), items[i]],
    ];

/// A 38×20 switch for settings that apply at once. Mirrors `<cm-toggle>`.
class CmToggle extends StatelessWidget {
  const CmToggle({super.key, required this.value, required this.onChanged, this.label, this.semanticLabel});
  final bool value;
  final ValueChanged<bool>? onChanged;
  final String? label;

  /// Accessible name when there is no visible [label].
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final enabled = onChanged != null;
    final track = AnimatedContainer(
      duration: cmDuration(context, CmMotion.fast),
      curve: CmMotion.standard,
      width: 36, height: 20,
      padding: const EdgeInsets.all(1),
      decoration: BoxDecoration(
        color: value ? c.toggleOn : c.toggleOff,
        border: Border.all(color: c.borderInput),
        borderRadius: BorderRadius.circular(CmRadius.full),
      ),
      alignment: value ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(width: 16, height: 16, decoration: BoxDecoration(color: c.bgSurface, shape: BoxShape.circle, border: Border.all(color: c.borderInput))),
    );
    return Semantics(
      toggled: value,
      enabled: enabled,
      label: semanticLabel ?? label,
      excludeSemantics: true, onTap: enabled ? () => onChanged!(!value) : null,
      child: FocusableActionDetector(
        enabled: enabled,
        mouseCursor: enabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
        actions: {ActivateIntent: CallbackAction<ActivateIntent>(onInvoke: (_) { onChanged?.call(!value); return null; })},
        child: GestureDetector(
          onTap: enabled ? () => onChanged!(!value) : null,
          child: Opacity(
            opacity: enabled ? 1 : 0.5,
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              track,
              if (label != null) ...[const SizedBox(width: CmSpace.s8), Text(label!, style: CmType.bodyMd.copyWith(color: c.textDefault))],
            ]),
          ),
        ),
      ),
    );
  }
}

/// One choice in a [CmSelect] or [CmCombobox].
class CmSelectOption<T> {
  const CmSelectOption(this.value, this.label, {this.group});
  final T value;
  final String label;

  /// Heading of the group the option belongs to ("Lead"), like an HTML `<optgroup label>`. Options of the same
  /// group are shown together under the heading, in the order the groups first appear. Since 1.3.
  final String? group;
}

/// Puts options of the same group together, in the order the groups first appear. Options without a group stay
/// where they are. Returns [options] itself when no option has a group.
List<CmSelectOption<T>> cmSortByGroup<T>(List<CmSelectOption<T>> options) {
  if (!options.any((o) => (o.group ?? '').isNotEmpty)) return options;
  final buckets = <(String, List<CmSelectOption<T>>)>[];
  final byGroup = <String, List<CmSelectOption<T>>>{};
  for (final o in options) {
    final g = o.group ?? '';
    if (g.isNotEmpty) {
      final b = byGroup[g];
      if (b != null) {
        b.add(o);
      } else {
        buckets.add((g, byGroup[g] = [o]));
      }
    } else if (buckets.isNotEmpty && buckets.last.$1.isEmpty) {
      buckets.last.$2.add(o);
    } else {
      buckets.add(('', [o]));
    }
  }
  return [for (final b in buckets) ...b.$2];
}

/// A group heading in an option list: never an option, skipped by the keyboard, read as a heading.
class CmOptionGroupHeading extends StatelessWidget {
  const CmOptionGroupHeading(this.text, {super.key, this.divider = false});
  final String text;

  /// Draws the line that separates a group from what comes before it.
  final bool divider;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    return Container(
      margin: EdgeInsets.only(top: divider ? CmSpace.s4 : 0),
      padding: EdgeInsets.fromLTRB(CmSpace.s20, divider ? CmSpace.s12 : CmSpace.s8, CmSpace.s20, 2),
      decoration: divider ? BoxDecoration(border: Border(top: BorderSide(color: c.borderSubtle))) : null,
      alignment: AlignmentDirectional.centerStart,
      child: Semantics(header: true, child: Text(text, style: CmType.bodySm.copyWith(fontSize: 12, height: 16 / 12, fontWeight: FontWeight.w600, color: c.textDefault))),
    );
  }
}

/// A field that opens a list of options: 40 tall ([small]: 32; 44 on touch screens; owner standard, 1.6).
/// Mirrors `<cm-select>`.
///
/// Options with a [CmSelectOption.group] are shown together under the group's heading (since 1.3); headings are
/// read as headings and skipped by the keyboard. With [showGroup] the field shows "Lead: Company".
class CmSelect<T> extends StatelessWidget {
  const CmSelect({super.key, required this.label, required this.options, required this.value, required this.onChanged, this.placeholder, this.helpText, this.error, this.showGroup = false, this.small = false});

  final String label;
  final List<CmSelectOption<T>> options;
  final T? value;
  final ValueChanged<T?>? onChanged;
  final String? placeholder, helpText, error;

  /// Shows the chosen option's group before its label in the field ([CmStrings.selectGrouped], "Lead: Company"),
  /// for grouped lists where labels repeat across groups. The list itself shows the bare label. Since 1.3.
  final bool showGroup;

  /// The 32px field for filter rows and toolbars (`size="small"` on the web). Since 1.6.
  final bool small;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final s = CmStrings.of(context);
    final h = cmFieldHeight(context, small: small);
    final sorted = cmSortByGroup(options);
    final grouped = !identical(sorted, options) || options.any((o) => (o.group ?? '').isNotEmpty);
    final items = <DropdownMenuItem<T>>[];
    final shown = <Widget>[];
    String? group;
    for (final o in sorted) {
      final g = o.group ?? '';
      if (grouped && g != group) {
        if (g.isNotEmpty) {
          items.add(DropdownMenuItem<T>(enabled: false, child: CmOptionGroupHeading(g, divider: items.isNotEmpty)));
          shown.add(const SizedBox.shrink());
        }
        group = g;
      }
      final text = showGroup && g.isNotEmpty ? s.selectGrouped(g, o.label) : o.label;
      items.add(DropdownMenuItem(value: o.value, child: Text(o.label, style: cmFieldText(context).copyWith(color: c.textDefault))));
      // One line ending in an ellipsis: the dense field is 24 tall, so a wrapped value would be clipped.
      shown.add(Align(alignment: AlignmentDirectional.centerStart, child: Text(text, maxLines: 1, softWrap: false, overflow: TextOverflow.ellipsis, style: cmFieldText(context).copyWith(color: c.textDefault))));
    }
    return Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
      _FieldLabel(label: label, small: small),
      SizedBox(height: small ? CmSpace.s4 : CmSpace.s8),
      DropdownButtonFormField<T>(
        value: value,
        items: items,
        selectedItemBuilder: (_) => shown,
        itemHeight: grouped ? null : kMinInteractiveDimension,
        onChanged: onChanged,
        hint: placeholder == null ? null : Text(placeholder!, style: cmFieldText(context).copyWith(color: c.textTertiary)),
        icon: CmIcon(CmIcons.chevronDown, size: 16, color: c.textDefault),
        isExpanded: true,
        dropdownColor: c.bgSurface,
        borderRadius: BorderRadius.circular(CmRadius.sm),
        decoration: InputDecoration(
          isDense: true,
          constraints: BoxConstraints(minHeight: h),
          // The dense dropdown button is 24 tall.
          contentPadding: EdgeInsets.symmetric(horizontal: small ? CmSpace.s8 : CmSpace.s12, vertical: (h - 24) / 2),
          errorText: error,
          errorStyle: CmType.bodyXs.copyWith(color: c.textCritical),
          helperText: error == null ? helpText : null,
          helperStyle: CmType.bodyXs.copyWith(color: c.textTertiary),
          helperMaxLines: 3,
          errorMaxLines: 3,
        ),
      ),
    ]);
  }
}

/// A grey search box with an optional filter button: 40 tall ([small]: 32; 44 on touch screens; owner standard,
/// 1.6). Mirrors `<cm-search>`.
class CmSearch extends StatelessWidget {
  const CmSearch({super.key, required this.label, this.controller, this.placeholder, this.onChanged, this.onSubmitted, this.onFilter, this.filterCount = 0, this.small = false});

  /// Accessible name, e.g. "Search orders".
  final String label;
  final TextEditingController? controller;
  final String? placeholder;
  final ValueChanged<String>? onChanged, onSubmitted;

  /// Shows a filter button when set.
  final VoidCallback? onFilter;

  /// Number of filters applied, shown on the filter button.
  final int filterCount;

  /// The 32px box for filter rows and toolbars. Since 1.6.
  final bool small;

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    final h = cmFieldHeight(context, small: small);
    return Row(children: [
      Expanded(
        // container: true keeps the field and the filter button as separate nodes; without it Flutter
        // merged both into one text field named "Search orders Filters", hiding the button.
        child: Semantics(
          container: true,
          label: label,
          child: TextField(
            controller: controller,
            onChanged: onChanged,
            onSubmitted: onSubmitted,
            textInputAction: TextInputAction.search,
            style: cmFieldText(context).copyWith(color: c.textDefault),
            decoration: InputDecoration(
              hintText: placeholder ?? label,
              isDense: true,
              fillColor: c.bgInputFilled,
              constraints: BoxConstraints(minHeight: h),
              contentPadding: cmFieldPadding(h, horizontal: CmSpace.s8),
              prefixIcon: Padding(padding: const EdgeInsetsDirectional.only(start: CmSpace.s12, end: CmSpace.s4), child: CmIcon(CmIcons.search, size: CmIconSize.sm, color: c.iconDefault)),
              prefixIconConstraints: const BoxConstraints(minWidth: 32),
            ),
          ),
        ),
      ),
      if (onFilter != null) ...[
        const SizedBox(width: CmSpace.s8),
        Semantics(
          container: true,
          button: true,
          label: filterCount > 0 ? CmStrings.of(context).withApplied(CmStrings.of(context).filters, filterCount) : CmStrings.of(context).filters,
          excludeSemantics: true, onTap: onFilter,
          child: InkWell(
            onTap: onFilter,
            borderRadius: BorderRadius.circular(CmRadius.sm),
            child: Container(
              height: h, padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(border: Border.all(color: c.borderInput), borderRadius: BorderRadius.circular(CmRadius.sm), color: c.bgSurface),
              child: Row(children: [
                CmIcon(CmIcons.filter, size: 16, color: c.textDefault),
                if (filterCount > 0) ...[const SizedBox(width: CmSpace.s4), Text('$filterCount', style: CmType.bodySm.copyWith(color: c.textDefault))],
              ]),
            ),
          ),
        ),
      ],
    ]);
  }
}

/// Formats input to digits only (for phone and quantity fields).
final cmDigitsOnly = FilteringTextInputFormatter.digitsOnly;
