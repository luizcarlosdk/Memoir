"""Static frontend regression checks that do not require an ASGI test client."""

from pathlib import Path


STATIC_DIR = Path(__file__).parents[1] / "static"


def test_frontend_ux_recovery_and_navigation_contracts() -> None:
    """Keep the usability affordances wired in the framework-free frontend."""
    html = (STATIC_DIR / "index.html").read_text(encoding="utf-8")
    script = (STATIC_DIR / "app.js").read_text(encoding="utf-8")
    styles = (STATIC_DIR / "styles.css").read_text(encoding="utf-8")

    for element_id in (
        "meetings-error",
        "retry-meetings",
        "clear-meeting-filters",
        "people-error",
        "retry-people",
        "clear-person-filters",
    ):
        assert f'id="{element_id}"' in html

    assert 'aria-controls="sidebar" aria-expanded="false"' in html
    assert 'aria-live="polite" aria-atomic="true"' in html
    assert "TXT, MD, JSON, SRT, or VTT" in html
    assert 'class="file-input"' in html
    assert '<span data-icon="people"></span><span>People</span>' in html

    assert 'function setRoute(path, historyMode = "push")' in script
    assert 'window.addEventListener("popstate"' in script
    assert 'setRoute(meetingRoute(meetingId, state.activeTab), historyMode)' in script
    assert 'setRoute(personRoute(personId, state.personDetailTab), historyMode)' in script
    assert 'elements.meetingsErrorMessage.textContent = state.meetingsLoadError' in script
    assert 'elements.peopleErrorMessage.textContent = state.personsLoadError' in script
    assert 'window.confirm("Discard this meeting draft?' in script
    assert "elements.sidebar.inert = isHidden" in script
    assert "elements.shell.inert = true" in script
    assert "More options" not in script

    # Keep visual meaning explicit and the collection scannable across layouts.
    assert '<span class="overline nav-label">Library</span>' in html
    assert 'class="meeting-table-header"' in html
    assert "sidebar-footer" not in html
    assert "page-actions" not in html
    assert 'className: "meeting-generic"' in script
    assert "const accents" not in script
    assert 'create("span", `status-badge ${processed ? "processed" : "processing"}`)' in script
    assert 'classList.toggle("hidden", state.meetings.length <= 3)' in script
    assert 'element.dataset.label = label' in script
    assert "--memoir-control-height: 48px" in styles
    assert "--memoir-content-measure: 70ch" in styles
    assert ".recent-section.hidden + .all-meetings-section" in styles
    assert ".meeting-table-header" in styles
    assert ".row-date::before" in styles
    assert "processed-check" not in styles

    assert '<form id="summary-form" novalidate>' in html
    for field_id in ("title", "meeting-start", "duration", "raw-transcript"):
        assert f'id="{field_id}-error" class="field-error hidden"' in html
    assert "function validateUploadForm()" in script
    assert 'field.setAttribute("aria-invalid", String(hasError))' in script
    assert 'field.addEventListener("blur", () => validateUploadField(field))' in script
    assert ".field.has-error > input" in styles
    assert ".field > .field-error" in styles
