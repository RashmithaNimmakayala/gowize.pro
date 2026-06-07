package pro.gowize.backend.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

/**
 * Heuristic parsing of OCR text lines into product fields. Deliberately
 * conservative — the user confirms/edits everything on the Confirm screen.
 */
@Component
public class ExtractionParser {

    public record Parsed(String name, String dateType, LocalDate expiryDate, String packageSize) {}

    // 2025-12-31 | 31/12/2025 | 31.12.25 | 31-12-2025
    private static final Pattern NUMERIC_DATE = Pattern.compile(
            "\\b(\\d{4})[-/.](\\d{1,2})[-/.](\\d{1,2})\\b"
            + "|\\b(\\d{1,2})[-/.](\\d{1,2})[-/.](\\d{2,4})\\b");

    // 12 DEC 2025 | DEC 2025 | DEC 25
    private static final Pattern MONTH_NAME_DATE = Pattern.compile(
            "\\b(?:(\\d{1,2})\\s+)?"
            + "(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*"
            + "\\.?\\s+(\\d{2,4})\\b", Pattern.CASE_INSENSITIVE);

    // 500ml, 200 g, 1 L, 24 tablets
    private static final Pattern PACKAGE_SIZE = Pattern.compile(
            "\\b\\d+(?:\\.\\d+)?\\s?(ml|l|g|kg|mg|tablets|tabs|capsules|caps|ct|count)\\b",
            Pattern.CASE_INSENSITIVE);

    private static final List<String> MONTHS = List.of(
            "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec");

    public Parsed parse(List<String> lines) {
        LocalDate bestDate = null;
        String packageSize = null;
        String dateType = "expiry";

        for (String raw : lines) {
            String line = raw.trim();
            if (line.isEmpty()) continue;

            String lower = line.toLowerCase(Locale.ROOT);
            if (lower.contains("best before") || lower.contains("best by")) dateType = "best-before";
            else if (lower.contains("use by")) dateType = "use-by";
            else if (lower.contains("exp")) dateType = "expiry";

            if (packageSize == null) {
                Matcher pm = PACKAGE_SIZE.matcher(line);
                if (pm.find()) packageSize = pm.group().replaceAll("\\s+", "");
            }

            LocalDate d = parseDate(line);
            if (d != null && (bestDate == null || d.isAfter(bestDate))) {
                bestDate = d;
            }
        }

        String name = guessName(lines);
        return new Parsed(name, dateType, bestDate, packageSize);
    }

    private LocalDate parseDate(String line) {
        Matcher nm = NUMERIC_DATE.matcher(line);
        if (nm.find()) {
            try {
                if (nm.group(1) != null) { // yyyy-mm-dd
                    return LocalDate.of(toInt(nm.group(1)), toInt(nm.group(2)), toInt(nm.group(3)));
                }
                int day = toInt(nm.group(4));
                int month = toInt(nm.group(5));
                int year = normalizeYear(toInt(nm.group(6)));
                return LocalDate.of(year, month, Math.max(1, day));
            } catch (Exception ignored) {
                // not a real calendar date
            }
        }
        Matcher mm = MONTH_NAME_DATE.matcher(line);
        if (mm.find()) {
            try {
                int month = MONTHS.indexOf(mm.group(2).toLowerCase(Locale.ROOT).substring(0, 3)) + 1;
                int year = normalizeYear(toInt(mm.group(3)));
                int day = mm.group(1) != null ? toInt(mm.group(1)) : lastDayOfMonth(year, month);
                return LocalDate.of(year, month, day);
            } catch (Exception ignored) {
                // not parseable
            }
        }
        return null;
    }

    /** Pick a plausible product name: the longest mostly-alphabetic early line. */
    private String guessName(List<String> lines) {
        String best = null;
        int limit = Math.min(lines.size(), 8);
        for (int i = 0; i < limit; i++) {
            String line = lines.get(i).trim();
            if (line.length() < 3) continue;
            long letters = line.chars().filter(Character::isLetter).count();
            if (letters < line.length() * 0.5) continue; // skip mostly-numeric lines
            if (parseDate(line) != null) continue;
            if (best == null || line.length() > best.length()) best = line;
        }
        return best;
    }

    private int toInt(String s) { return Integer.parseInt(s); }

    private int normalizeYear(int y) { return y < 100 ? 2000 + y : y; }

    private int lastDayOfMonth(int year, int month) {
        return LocalDate.of(year, month, 1).lengthOfMonth();
    }

    public static String iso(LocalDate d) {
        return d == null ? null : d.format(DateTimeFormatter.ISO_LOCAL_DATE);
    }
}
