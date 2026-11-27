import 'package:commmerce_ui/commmerce_ui.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  for (final (name, theme, c) in [
    ('light', CmTheme.light(), CmColors.light),
    ('dark', CmTheme.dark(), CmColors.dark),
  ]) {
    group('CmTheme.$name colour scheme', () {
      final s = theme.colorScheme;

      test('has no Material surface tint', () {
        expect(s.surfaceTint, Colors.transparent);
      });

      test('containers map to tokens, not Material fallbacks', () {
        expect(s.secondaryContainer, isNot(c.textAttention));
        expect(s.secondaryContainer, c.bgSelected);
        expect(s.onSecondaryContainer, c.textDefault);
        expect(s.primaryContainer, isNot(s.primary));
        expect(s.primaryContainer, c.bgSelected);
        expect(s.onPrimaryContainer, c.textDefault);
        expect(s.tertiary, c.textInformation);
        expect(s.tertiary, isNot(s.primary));
        expect(s.tertiaryContainer, c.bgInformationSoft);
        expect(s.errorContainer, c.bgCritical);
        expect(s.onErrorContainer, c.textCritical);
      });

      test('surface containers map to tokens', () {
        expect(s.surfaceContainerLowest, c.bgSurface);
        expect(s.surfaceContainerLow, c.bgPage);
        expect(s.surfaceContainer, c.bgInset);
        expect(s.surfaceContainerHigh, c.bgHover);
        expect(s.surfaceContainerHighest, c.bgHover);
        expect(s.surfaceDim, c.bgPage);
        expect(s.surfaceBright, c.bgSurface);
      });

      test('inverse colours and scrim map to tokens', () {
        expect(s.inverseSurface, c.textDefault);
        expect(s.onInverseSurface, c.bgSurface);
        expect(s.inversePrimary, c.actionPrimaryText);
        expect(s.scrim, c.overlay);
        expect(s.shadow, Colors.black);
      });
    });
  }

  testWidgets('a selected ChoiceChip does not paint textAttention', (tester) async {
    await tester.pumpWidget(MaterialApp(
      theme: CmTheme.light(),
      home: Scaffold(
        body: Center(child: ChoiceChip(label: const Text('A'), selected: true, onSelected: (_) {})),
      ),
    ));
    final chipTheme = ChipTheme.of(tester.element(find.byType(ChoiceChip)));
    expect(chipTheme.selectedColor, anyOf(isNull, isNot(CmColors.light.textAttention)));
    final painted = tester.widget<Material>(
      find.descendant(of: find.byType(ChoiceChip), matching: find.byType(Material)).first,
    );
    expect(painted.color, isNot(CmColors.light.textAttention));
    expect(Theme.of(tester.element(find.byType(ChoiceChip))).colorScheme.secondaryContainer, CmColors.light.bgSelected);
  });
}
