export type AppLocale = "en" | "zh-TW";

export const defaultLocale: AppLocale = "zh-TW";

export const localeStorageKey = "projectmanagement-locale";

/** Flat message keys — both locales must define every key. */
export type MessageKey =
  | "common.projects"
  | "common.dashboard"
  | "common.docs"
  | "common.home"
  | "common.documents"
  | "common.allProjects"
  | "common.browseDocs"
  | "common.createProject"
  | "common.cancel"
  | "common.create"
  | "common.creating"
  | "common.raw"
  | "common.saved"
  | "common.saveShortcut"
  | "common.unsavedChanges"
  | "common.saving"
  | "common.langEn"
  | "common.langZhTw"
  | "common.more"
  | "common.teamCalendar"
  | "common.profile"
  | "common.teamSettings"
  | "mdViewer.view"
  | "mdViewer.split"
  | "mdViewer.edit"
  | "mdViewer.layoutAria"
  | "mdViewer.docCardAria"
  | "mdViewer.saveFailed"
  | "theme.system"
  | "theme.light"
  | "theme.dark"
  | "theme.cycleTitle"
  | "home.title"
  | "home.subtitle"
  | "home.empty"
  | "home.dashboard"
  | "createProject.cta"
  | "createProject.title"
  | "createProject.subtitle"
  | "createProject.nameLabel"
  | "createProject.placeholder"
  | "createProject.error"
  | "projectHome.subtitle"
  | "projectHome.openDashboard"
  | "projectHome.docs"
  | "projectHome.iframeTitle"
  | "dash.title"
  | "dash.subtitleIntro"
  | "dash.publicHomeLabel"
  | "dash.tabHome"
  | "dash.tabDocs"
  | "dash.tabAi"
  | "dash.aiSectionTitle"
  | "dash.aiSectionDesc"
  | "dash.aiIndexStatus"
  | "dash.aiIndexEmpty"
  | "dash.aiIndexLoading"
  | "dash.aiRebuildIndex"
  | "dash.aiNewChat"
  | "dash.aiNewChatFailed"
  | "dash.aiIndexing"
  | "dash.aiIndexFailed"
  | "dash.aiHint"
  | "dash.aiEmpty"
  | "dash.aiRoleUser"
  | "dash.aiRoleAssistant"
  | "dash.aiCopyYourMessage"
  | "dash.aiThinking"
  | "dash.aiPlaceholder"
  | "dash.aiSend"
  | "dash.aiError"
  | "dash.aiToolTrace"
  | "dash.aiStop"
  | "dash.aiRateLimited"
  | "dash.aiPhaseThinking"
  | "dash.aiPhaseReadingFile"
  | "dash.aiPhaseReadingHome"
  | "dash.aiPhaseListingDocs"
  | "dash.aiPhaseListingHome"
  | "dash.aiPhaseWritingFile"
  | "dash.aiPhaseDeletingFile"
  | "dash.aiPhaseRenamingFile"
  | "dash.aiPhaseSearching"
  | "dash.aiPhaseGrepping"
  | "dash.aiPhaseWritingHome"
  | "dash.aiPhaseTool"
  | "ai.fabTitle"
  | "ai.panelTitle"
  | "ai.panelSubtitle"
  | "ai.panelDescription"
  | "ai.closePanel"
  | "dash.homeFilesTitle"
  | "dash.homeFilesDesc"
  | "dash.customOnDisk"
  | "dash.customOnDiskLink"
  | "dash.customOnDiskSuffix"
  | "dash.docsSectionTitle"
  | "dash.docsSectionDesc"
  | "dash.deleteSectionTitle"
  | "dash.deleteSectionDesc"
  | "dash.deleteProject"
  | "dash.deleteProjectConfirm"
  | "dash.deletingProject"
  | "dash.deleteProjectFailed"
  | "docsPage.title"
  | "docsPage.subtitleLead"
  | "docsPage.subtitleTrail"
  | "docsPage.filterBanner"
  | "docsPage.showAll"
  | "explorer.noMatch"
  | "explorer.noProjects"
  | "explorer.manageDashboard"
  | "explorer.noDocs"
  | "kind.markdown"
  | "kind.pdf"
  | "kind.image"
  | "kind.html"
  | "kind.code"
  | "kind.other"
  | "upload.replaceTitle"
  | "upload.replaceDesc"
  | "upload.choose"
  | "upload.uploading"
  | "upload.failed"
  | "upload.savedAs"
  | "docPage.embedNote"
  | "docViewer.pdfHint"
  | "docViewer.htmlHint"
  | "docViewer.mdHint"
  | "docViewer.codeHint"
  | "docViewer.otherHint"
  | "docViewer.openFile"
  | "docsWs.pasteTitle"
  | "docsWs.pathLabel"
  | "docsWs.pathPlaceholder"
  | "docsWs.contentLabel"
  | "docsWs.saveMd"
  | "docsWs.saving"
  | "docsWs.uploadTitle"
  | "docsWs.uploadDesc"
  | "docsWs.chooseFile"
  | "docsWs.working"
  | "docsWs.reloadList"
  | "docsWs.publishedTitle"
  | "docsWs.publishedHelp"
  | "docsWs.noFiles"
  | "docsWs.pathUnderDocs"
  | "docsWs.save"
  | "docsWs.rawMd"
  | "docsWs.editPath"
  | "docsWs.delete"
  | "docsWs.openMd"
  | "docsWs.openViewer"
  | "docsWs.uploadFailed"
  | "docsWs.saveFailed"
  | "docsWs.deleteFailed"
  | "docsWs.renameFailed"
  | "docsWs.pathEmpty"
  | "docsWs.confirmDelete"
  | "docsWs.statusUploaded"
  | "docsWs.statusDeleted"
  | "docsWs.statusRenamed"
  | "docsWs.statusSavedMd"
  | "login.title"
  | "login.subtitle"
  | "login.emailLabel"
  | "login.emailPlaceholder"
  | "login.sendCode"
  | "login.sending"
  | "login.codeLabel"
  | "login.codePlaceholder"
  | "login.verify"
  | "login.verifying"
  | "login.sentHint"
  | "login.genericError"
  | "login.rateLimited"
  | "login.backToEmail"
  | "login.notConfigured"
  | "login.devChecklist"
  | "login.backHome"
  | "login.resendHintTesting"
  | "login.resendHintFrom"
  | "login.resendHintUnknown"
  | "login.subtitleUsername"
  | "login.usernameLabel"
  | "login.usernamePlaceholder"
  | "login.tabRegister"
  | "login.tabLogin"
  | "login.submitRegister"
  | "login.submitLogin"
  | "login.openModeTitle"
  | "login.openModeIntro"
  | "login.hintsHeading"
  | "teamCal.title"
  | "teamCal.subtitle"
  | "teamCal.backProjects"
  | "teamCal.loading"
  | "teamCal.loadFailed"
  | "teamCal.noEvents"
  | "teamCal.eventTitle"
  | "teamCal.start"
  | "teamCal.end"
  | "teamCal.notes"
  | "teamCal.assign"
  | "teamCal.save"
  | "teamCal.saving"
  | "teamCal.delete"
  | "teamCal.newEvent"
  | "teamCal.editEvent"
  | "teamCal.eventsHeading"
  | "teamCal.adminBadge"
  | "teamCal.memberBadge"
  | "teamCal.createReservedUser"
  | "teamCal.createUserBtn"
  | "teamCal.today"
  | "teamCal.prev"
  | "teamCal.next"
  | "teamCal.viewMonth"
  | "teamCal.viewWeek"
  | "teamCal.viewDay"
  | "teamCal.viewAgenda"
  | "teamCal.agendaToolbar"
  | "teamCal.more"
  | "teamCal.noEventsInRange"
  | "teamCal.newEventSlot"
  | "teamCal.validationTitleTime"
  | "teamCal.userCreatedOk"
  | "teamCal.newEventCta"
  | "teamCal.openDaySheetAria"
  | "teamCal.daySheetHint"
  | "teamCal.daySheetEmpty"
  | "teamCal.clickDayForSchedule"
  | "teamCal.wd.mon"
  | "teamCal.wd.tue"
  | "teamCal.wd.wed"
  | "teamCal.wd.thu"
  | "teamCal.wd.fri"
  | "teamCal.wd.sat"
  | "teamCal.wd.sun"
  | "teamCal.teamAdmin"
  | "teamAdmin.title"
  | "teamAdmin.subtitle"
  | "teamAdmin.backCalendar"
  | "teamAdmin.usersHeading"
  | "teamAdmin.keysHeading"
  | "teamAdmin.createUserLabel"
  | "teamAdmin.createUserBtn"
  | "teamAdmin.roleMember"
  | "teamAdmin.roleViewer"
  | "teamAdmin.saveRole"
  | "teamAdmin.accessKeyBtn"
  | "teamAdmin.accessKeyHint"
  | "teamAdmin.accessKeyRevealed"
  | "teamAdmin.clearAccessKey"
  | "teamAdmin.keyKindInvite"
  | "teamAdmin.keyKindRedeem"
  | "teamAdmin.createKeyBtn"
  | "teamAdmin.keyLabel"
  | "teamAdmin.expiresOptional"
  | "teamAdmin.maxUsesOptional"
  | "teamAdmin.secretOnce"
  | "teamAdmin.copySecret"
  | "teamAdmin.copiedSecret"
  | "teamAdmin.deleteKey"
  | "teamAdmin.impersonateHeading"
  | "teamAdmin.impersonateBtn"
  | "teamAdmin.redeemKeyHeading"
  | "teamAdmin.redeemKeyBtn"
  | "teamAdmin.memberStatusPending"
  | "teamAdmin.memberStatusApproved"
  | "teamAdmin.hasLoginKey"
  | "teamAdmin.approveUserBtn"
  | "teamAdmin.newMemberAccessKeyBtn"
  | "teamAdmin.memberLoginKeyHint"
  | "profile.title"
  | "profile.subtitle"
  | "profile.hue"
  | "profile.avatar"
  | "profile.backupKey"
  | "profile.backupHint"
  | "profile.generateBackupKeyBtn"
  | "profile.generateBackupKeyDone"
  | "profile.generatedBackupWarn"
  | "profile.copyGeneratedBackup"
  | "profile.copiedGeneratedBackup"
  | "profile.dismissGeneratedBackup"
  | "profile.save"
  | "profile.teamUsername"
  | "profile.teamUsernameHelp"
  | "profile.copyUsername"
  | "profile.copiedUsername"
  | "profile.emailModeKeyHint"
  | "login.backupKeyOptional"
  | "login.emailOtpBackupHint"
  | "login.adminOtpHeading"
  | "login.memberKeyHeading"
  | "login.memberKeyBody"
  | "login.memberKeyPlaceholder"
  | "login.memberKeySubmit"
  | "login.registerRequestHeading"
  | "login.registerRequestBody"
  | "login.registerRequestSubmit"
  | "login.registerRequestOk"
  | "login.adminAccessEmailHint"
  | "login.backupFlowTitle"
  | "login.backupFlowBody"
  | "login.backupIdentifierPlaceholder"
  | "login.backupSubmit"
  | "login.inviteHeading"
  | "login.inviteUsername"
  | "login.inviteKey"
  | "login.inviteSubmit"
  | "login.adminAccessHeading"
  | "login.adminAccessUser"
  | "login.adminAccessKey"
  | "login.adminAccessSubmit"
  | "auth.logout"
  | "publicShare.shareButton"
  | "publicShare.dialogTitle"
  | "publicShare.dialogDescription"
  | "publicShare.enableHint"
  | "publicShare.enableButton"
  | "publicShare.revokeButton"
  | "publicShare.closeButton"
  | "publicShare.copyLink"
  | "publicShare.copied"
  | "publicShare.copyFailed"
  | "publicShare.toggleFailed"
  | "publicShare.nowPublic"
  | "publicShare.nowPrivate"
  | "publicShare.loading"
  | "publicShare.readOnlyBadge"
  | "publicShare.publicBadge"
  | "viewerUi.hideAll"
  | "viewerUi.showAll"
  | "viewerUi.viewModeToolbar"
  | "viewerUi.standardLayout"
  | "viewerUi.focusLayout";

const en: Record<MessageKey, string> = {
  "common.projects": "Projects",
  "common.dashboard": "Dashboard",
  "common.docs": "Docs",
  "common.home": "Home",
  "common.documents": "Documents",
  "common.allProjects": "All projects",
  "common.browseDocs": "Browse docs",
  "common.createProject": "Create project",
  "common.cancel": "Cancel",
  "common.create": "Create",
  "common.creating": "Creating…",
  "common.raw": "Raw",
  "common.saved": "Saved",
  "common.saveShortcut": "⌘S / Ctrl+S to save",
  "common.unsavedChanges": "Unsaved changes",
  "common.saving": "Saving…",
  "common.langEn": "EN",
  "common.langZhTw": "繁中",
  "common.more": "More",
  "common.teamCalendar": "Team calendar",
  "common.profile": "Profile",
  "common.teamSettings": "Team admin",
  "mdViewer.view": "View",
  "mdViewer.split": "Split",
  "mdViewer.edit": "Edit",
  "mdViewer.layoutAria": "Editor layout",
  "mdViewer.docCardAria": "Document",
  "mdViewer.saveFailed": "Save failed",
  "theme.system": "System",
  "theme.light": "Light",
  "theme.dark": "Dark",
  "theme.cycleTitle": "Theme: {{label}}. Click to cycle system → light → dark.",
  "home.title": "Projects",
  "home.subtitle":
    "Each project has a public home, docs URLs, and a {{dash}} hub to manage uploads. Files are served like {{docExample}}.",
  "home.empty":
    "No projects yet. Use {{create}} to add your first one.",
  "home.dashboard": "Dashboard",
  "createProject.cta": "Create project",
  "createProject.title": "New project",
  "createProject.subtitle":
    "Choose a display name. The URL uses a slug derived from it (for example {{example}}).",
  "createProject.nameLabel": "Project name",
  "createProject.placeholder": "e.g. Acme roadmap",
  "createProject.error": "Could not create project",
  "projectHome.subtitle":
    "Add {{html}} or {{tsx}} from the dashboard for a full-page site here, or publish docs under {{docs}}.",
  "projectHome.openDashboard": "Open dashboard",
  "projectHome.docs": "Docs",
  "projectHome.iframeTitle": "Custom project home",
  "dash.title": "Dashboard",
  "dash.subtitleIntro":
    "Manage the public home page and docs for {{name}}.",
  "dash.publicHomeLabel": "Public home:",
  "dash.tabHome": "Home page",
  "dash.tabDocs": "Docs",
  "dash.tabAi": "AI",
  "dash.aiSectionTitle": "Project AI",
  "dash.aiSectionDesc":
    "Chat uses OpenRouter. Search and tools cover this project’s docs and public home page (HTML/TSX). Build the index for semantic search.",
  "dash.aiIndexStatus": "Search index: {{count}} chunks · {{time}}",
  "dash.aiIndexEmpty": "No search index yet — rebuild to enable semantic search.",
  "dash.aiIndexLoading": "Loading index status…",
  "dash.aiRebuildIndex": "Rebuild search index",
  "dash.aiNewChat": "New chat",
  "dash.aiNewChatFailed": "Could not start a new chat",
  "dash.aiIndexing": "Indexing…",
  "dash.aiIndexFailed": "Could not rebuild index",
  "dash.aiHint":
    "The assistant can manage docs and the public home page (custom.html / custom.tsx) for this project only.",
  "dash.aiEmpty": "Ask about your docs or home page, or request edits.",
  "dash.aiRoleUser": "You",
  "dash.aiRoleAssistant": "Assistant",
  "dash.aiCopyYourMessage": "Copy your message",
  "dash.aiThinking": "Thinking…",
  "dash.aiPlaceholder": "Message the project assistant…",
  "dash.aiSend": "Send",
  "dash.aiError": "Request failed",
  "dash.aiToolTrace": "Tool trace",
  "dash.aiStop": "Stop",
  "dash.aiRateLimited": "Too many requests. Try again in {{sec}}s.",
  "dash.aiPhaseThinking": "Thinking…",
  "dash.aiPhaseReadingFile": "Reading {{path}}",
  "dash.aiPhaseReadingHome": "Reading {{file}}",
  "dash.aiPhaseListingDocs": "Listing documents…",
  "dash.aiPhaseListingHome": "Listing home page…",
  "dash.aiPhaseWritingFile": "Writing {{path}}",
  "dash.aiPhaseDeletingFile": "Deleting {{path}}",
  "dash.aiPhaseRenamingFile": "Renaming {{from}} → {{to}}",
  "dash.aiPhaseSearching": "Searching…",
  "dash.aiPhaseGrepping": "Searching in files…",
  "dash.aiPhaseWritingHome": "Writing {{file}}",
  "dash.aiPhaseTool": "{{tool}}",
  "ai.fabTitle": "Open project AI assistant",
  "ai.panelTitle": "{{name}}",
  "ai.panelSubtitle": "Project assistant · docs & home",
  "ai.panelDescription":
    "Chat with the project assistant. Tools only affect this project’s docs and home page files.",
  "ai.closePanel": "Close chat",
  "dash.homeFilesTitle": "Home page files",
  "dash.homeFilesDesc":
    "Upload HTML (sandboxed full-page iframe) or TSX (full-page live preview on the project home URL). The home route is a full-bleed replacement when a file is present.",
  "dash.customOnDisk": "{{file}} is on disk — open",
  "dash.customOnDiskLink": "public home",
  "dash.customOnDiskSuffix": "to see it.",
  "dash.docsSectionTitle": "Docs",
  "dash.docsSectionDesc": "Files are served at {{path}}.",
  "dash.deleteSectionTitle": "Delete project",
  "dash.deleteSectionDesc":
    "Remove this project from disk, including all docs and home uploads. This cannot be undone.",
  "dash.deleteProject": "Delete project",
  "dash.deleteProjectConfirm":
    "Delete “{{name}}” (/{{slug}}) and all of its files? This cannot be undone.",
  "dash.deletingProject": "Deleting…",
  "dash.deleteProjectFailed": "Could not delete project",
  "docsPage.title": "Documents",
  "docsPage.subtitleLead":
    "Browse files across projects. Each tile opens the public doc URL. Add or remove files from each project’s",
  "docsPage.subtitleTrail": ".",
  "docsPage.filterBanner": "Showing documents for {{name}}",
  "docsPage.showAll": "Show all projects",
  "explorer.noMatch": "No project matches that filter, or it has no files yet.",
  "explorer.noProjects":
    "No projects yet. Create one from the home page, then add files from its dashboard.",
  "explorer.manageDashboard": "Manage in dashboard",
  "explorer.noDocs": "No documents in this project yet.",
  "kind.markdown": "Markdown",
  "kind.pdf": "PDF",
  "kind.image": "Image",
  "kind.html": "HTML",
  "kind.code": "Code",
  "kind.other": "Other",
  "upload.replaceTitle": "Replace home page",
  "upload.replaceDesc":
    "Upload HTML for a sandboxed iframe preview, or TSX/JSX for an in-browser live preview (react-live: React + lucide-react only; not executed on the server).",
  "upload.choose": "Choose .html or .tsx file",
  "upload.uploading": "Uploading…",
  "upload.failed": "Upload failed",
  "upload.savedAs": "Saved as {{name}}.",
  "docPage.embedNote": "(embeds that URL below)",
  "docViewer.pdfHint":
    "Preview loads from the published docs URL (same origin). If your browser console shows failed requests to another host or port (for example an old dev server), those usually come from link annotations inside the PDF, not from this app.",
  "docViewer.htmlHint": "Sandboxed preview of uploaded HTML.",
  "docViewer.mdHint": "Markdown should open in the editor workspace.",
  "docViewer.codeHint": "Text preview in a sandboxed frame. Use Raw for download.",
  "docViewer.otherHint":
    "No built-in preview for this file type. Open the raw URL or download.",
  "docViewer.openFile": "Open file",
  "docsWs.pasteTitle": "Paste Markdown",
  "docsWs.pathLabel": "File path (under docs)",
  "docsWs.pathPlaceholder": "summary.md or notes/q1.md",
  "docsWs.contentLabel": "Content",
  "docsWs.saveMd": "Save Markdown",
  "docsWs.saving": "Saving…",
  "docsWs.uploadTitle": "Upload files",
  "docsWs.uploadDesc":
    "PDFs, images, or any other assets. Filenames keep their path under {{path}}",
  "docsWs.chooseFile": "Choose file",
  "docsWs.working": "Working…",
  "docsWs.reloadList": "Reload list from disk",
  "docsWs.publishedTitle": "Published paths",
  "docsWs.publishedHelp":
    "Names use your Unicode filenames. Click a title to open: Markdown in the split editor with live preview, other types in the in-app viewer (breadcrumbs + nav). Append {{raw}} on the {{docs}} URL for raw text. Use {{edit}} to move or rename under {{docsFolder}}.",
  "docsWs.noFiles": "No files yet — upload or paste Markdown above.",
  "docsWs.pathUnderDocs": "Path under docs",
  "docsWs.save": "Save",
  "docsWs.rawMd": "Raw .md",
  "docsWs.editPath": "Edit path",
  "docsWs.delete": "Delete",
  "docsWs.openMd": "Open in Markdown editor",
  "docsWs.openViewer": "Open in viewer",
  "docsWs.uploadFailed": "Upload failed",
  "docsWs.saveFailed": "Save failed",
  "docsWs.deleteFailed": "Delete failed",
  "docsWs.renameFailed": "Rename failed",
  "docsWs.pathEmpty": "Path cannot be empty",
  "docsWs.confirmDelete":
    "Delete “{{path}}” from this project? This cannot be undone.",
  "docsWs.statusUploaded": "Uploaded {{path}}.",
  "docsWs.statusDeleted": "Deleted {{path}}.",
  "docsWs.statusRenamed": "Renamed to {{path}}.",
  "docsWs.statusSavedMd": "Saved {{path}}.",
  "login.title": "Sign in",
  "login.subtitle": "Admins use email OTP; members use an access key after an admin approves them.",
  "login.emailLabel": "Email",
  "login.emailPlaceholder": "you@example.com",
  "login.sendCode": "Email me a code",
  "login.sending": "Sending…",
  "login.codeLabel": "6-digit code",
  "login.codePlaceholder": "000000",
  "login.verify": "Verify and continue",
  "login.verifying": "Verifying…",
  "login.sentHint": "Check your inbox for {{email}}.",
  "login.genericError": "Something went wrong. Try again.",
  "login.rateLimited": "Please wait {{sec}} seconds before requesting another code.",
  "login.backToEmail": "Use a different email",
  "login.notConfigured":
    "Sign-in is not configured on this deployment (missing server environment variables).",
  "login.devChecklist": "Local dev — fix these in `.env.local`, then restart `npm run dev`:",
  "login.backHome": "Back to projects",
  "login.resendHintTesting":
    "Resend test sender (e.g. onboarding@resend.dev) can only deliver OTP to your Resend-account email. To let other allowlisted addresses receive mail: verify your domain in Resend, set RESEND_FROM to an address on that domain, then try again.",
  "login.resendHintFrom":
    "The From address is not accepted by Resend. Use an address on a domain you have verified in the Resend dashboard (RESEND_FROM).",
  "login.resendHintUnknown":
    "The email provider rejected this send. Check server logs, RESEND_API_KEY, and RESEND_FROM; with a verified domain you can deliver to any allowlisted address.",
  "login.subtitleUsername": "Create an account with a username, or sign in with an existing one.",
  "login.usernameLabel": "Username",
  "login.usernamePlaceholder": "e.g. alex_team",
  "login.tabRegister": "Create account",
  "login.tabLogin": "Sign in",
  "login.submitRegister": "Create and sign in",
  "login.submitLogin": "Sign in",
  "login.openModeTitle": "Sign-in is off",
  "login.openModeIntro":
    "Anyone can use this deployment. Set AUTH_SECRET (16+ characters) for username-only accounts, or configure email OTP with AUTH_ALLOWED_EMAILS and Resend.",
  "login.hintsHeading": "Sign-in options",
  "teamCal.title": "Team calendar",
  "teamCal.subtitle":
    "Click a date to open its schedule as blocks, then click a block for details. Admins can add from that screen or from time slots in Week/Day view.",
  "teamCal.backProjects": "Projects",
  "teamCal.loading": "Loading…",
  "teamCal.loadFailed": "Could not load calendar.",
  "teamCal.noEvents": "No events yet.",
  "teamCal.eventTitle": "Title",
  "teamCal.start": "Start",
  "teamCal.end": "End",
  "teamCal.notes": "Notes",
  "teamCal.assign": "Assign people",
  "teamCal.save": "Save event",
  "teamCal.saving": "Saving…",
  "teamCal.delete": "Delete",
  "teamCal.newEvent": "New event",
  "teamCal.editEvent": "Edit event",
  "teamCal.eventsHeading": "Events",
  "teamCal.adminBadge": "Admin",
  "teamCal.memberBadge": "Member",
  "teamCal.createReservedUser": "Create username (admin-only names)",
  "teamCal.createUserBtn": "Create user",
  "teamCal.today": "Today",
  "teamCal.prev": "Previous",
  "teamCal.next": "Next",
  "teamCal.viewMonth": "Month",
  "teamCal.viewWeek": "Week",
  "teamCal.viewDay": "Day",
  "teamCal.viewAgenda": "Agenda",
  "teamCal.agendaToolbar": "Agenda · next 8 weeks from selected day",
  "teamCal.more": "more",
  "teamCal.noEventsInRange": "No events in this range.",
  "teamCal.newEventSlot": "Create event in this time slot",
  "teamCal.validationTitleTime": "Title and valid start/end are required.",
  "teamCal.userCreatedOk": "User created.",
  "teamCal.newEventCta": "Create",
  "teamCal.openDaySheetAria": "Open this day’s schedule",
  "teamCal.daySheetHint": "Choose a block to view or edit details.",
  "teamCal.daySheetEmpty": "Nothing scheduled this day.",
  "teamCal.clickDayForSchedule": "Open this day for all items",
  "teamCal.wd.mon": "Mon",
  "teamCal.wd.tue": "Tue",
  "teamCal.wd.wed": "Wed",
  "teamCal.wd.thu": "Thu",
  "teamCal.wd.fri": "Fri",
  "teamCal.wd.sat": "Sat",
  "teamCal.wd.sun": "Sun",
  "teamCal.teamAdmin": "Team admin",
  "teamAdmin.title": "Team admin",
  "teamAdmin.subtitle": "Manage people, access keys, and invite/redeem tokens.",
  "teamAdmin.backCalendar": "Calendar",
  "teamAdmin.usersHeading": "Users",
  "teamAdmin.keysHeading": "Invite & redeem keys",
  "teamAdmin.createUserLabel": "New username",
  "teamAdmin.createUserBtn": "Create user",
  "teamAdmin.roleMember": "Member",
  "teamAdmin.roleViewer": "Viewer (docs only)",
  "teamAdmin.saveRole": "Save role",
  "teamAdmin.accessKeyBtn": "Set admin access key",
  "teamAdmin.accessKeyHint":
    "Lets an operator sign in as this account using username + key from the login page. Copy the key when shown; it is not stored in plain text.",
  "teamAdmin.accessKeyRevealed": "New admin access key (copy now)",
  "teamAdmin.clearAccessKey": "Clear admin access key",
  "teamAdmin.keyKindInvite": "Invite (new username)",
  "teamAdmin.keyKindRedeem": "Redeem (promote viewer → member)",
  "teamAdmin.createKeyBtn": "Generate key",
  "teamAdmin.keyLabel": "Label",
  "teamAdmin.expiresOptional": "Expires (optional, local datetime)",
  "teamAdmin.maxUsesOptional": "Max uses (optional, blank = unlimited)",
  "teamAdmin.secretOnce": "Secret (copy now; shown only once)",
  "teamAdmin.copySecret": "Copy key",
  "teamAdmin.copiedSecret": "Key copied.",
  "teamAdmin.deleteKey": "Revoke",
  "teamAdmin.impersonateHeading": "Sign in with admin access key",
  "teamAdmin.impersonateBtn": "Open login with this flow",
  "teamAdmin.redeemKeyHeading": "Redeem a key while signed in",
  "teamAdmin.redeemKeyBtn": "Apply redeem key",
  "teamAdmin.memberStatusPending": "pending approval",
  "teamAdmin.memberStatusApproved": "approved",
  "teamAdmin.hasLoginKey": "has access key",
  "teamAdmin.approveUserBtn": "Approve & issue key",
  "teamAdmin.newMemberAccessKeyBtn": "New access key",
  "teamAdmin.memberLoginKeyHint":
    "After you approve someone (or create a user here), copy the member access key once — they sign in on the login page with that key only.",
  "profile.title": "Profile",
  "profile.subtitle": "Calendar color, avatar label, and team handle.",
  "profile.hue": "Calendar hue (0–360)",
  "profile.avatar": "Avatar (emoji or short text, shown on calendar)",
  "profile.backupKey": "Backup login key",
  "profile.backupHint":
    "Set your own secret, or use “Generate backup key” for a random one. After saving (or generating), sign in with team username or this email plus the key (no OTP). Leave empty and save to clear.",
  "profile.generateBackupKeyBtn": "Generate random backup key",
  "profile.generateBackupKeyDone": "New backup key created — copy it from the highlighted box below.",
  "profile.generatedBackupWarn": "Save this key somewhere safe. It will not be shown again.",
  "profile.copyGeneratedBackup": "Copy key",
  "profile.copiedGeneratedBackup": "Key copied.",
  "profile.dismissGeneratedBackup": "Dismiss",
  "profile.save": "Save",
  "profile.teamUsername": "Team username",
  "profile.teamUsernameHelp":
    "Calendar and backup login use this handle (auto-created for email accounts). Copy it if you sign in with email OTP and later want backup login.",
  "profile.copyUsername": "Copy",
  "profile.copiedUsername": "Copied.",
  "profile.emailModeKeyHint":
    "Member access keys are created when an admin approves you or adds you from Team admin. Sign in on the login page with that key.",
  "login.backupKeyOptional": "Backup key (only if you already set one in Profile)",
  "login.emailOtpBackupHint":
    "Allowlisted admins use email OTP. Everyone else requests a username, waits for approval, then signs in with the access key an admin sends them.",
  "login.adminOtpHeading": "Admin — email one-time code",
  "login.memberKeyHeading": "Team member — access key",
  "login.memberKeyBody":
    "Paste the full key your admin gave you after approving your account (or after creating your user). No username field — the key alone identifies you.",
  "login.memberKeyPlaceholder": "Access key",
  "login.memberKeySubmit": "Sign in with key",
  "login.registerRequestHeading": "Request team access",
  "login.registerRequestBody":
    "Pick a unique team username. An allowlisted admin will see your request on the Team admin page and can approve you.",
  "login.registerRequestSubmit": "Submit request",
  "login.registerRequestOk": "Request received. Wait for an admin to approve your username, then use the access key they send you.",
  "login.adminAccessEmailHint":
    "For support: sign in as another user when an admin access key was set for them on Team admin (separate from member access keys).",
  "login.backupFlowTitle": "Backup login (no OTP)",
  "login.backupFlowBody":
    "Use the account email or team username from Profile, plus the backup key you saved there.",
  "login.backupIdentifierPlaceholder": "you@company.com or team_username",
  "login.backupSubmit": "Sign in with backup key",
  "login.inviteHeading": "Redeem invite",
  "login.inviteUsername": "Choose username",
  "login.inviteKey": "Invite key",
  "login.inviteSubmit": "Create account & sign in",
  "login.adminAccessHeading": "Admin access (username + per-account key)",
  "login.adminAccessUser": "Team username or account email",
  "login.adminAccessKey": "Admin access key",
  "login.adminAccessSubmit": "Sign in as account",
  "auth.logout": "Log out",
  "publicShare.shareButton": "Share",
  "publicShare.dialogTitle": "Public link",
  "publicShare.dialogDescription":
    "Anyone with the link can open this page without signing in. Turn sharing off anytime.",
  "publicShare.enableHint": "Sharing is off. Enable to get a copyable public URL.",
  "publicShare.enableButton": "Enable public link",
  "publicShare.revokeButton": "Turn off public link",
  "publicShare.closeButton": "Close",
  "publicShare.copyLink": "Copy public link",
  "publicShare.copied": "Link copied.",
  "publicShare.copyFailed": "Could not copy.",
  "publicShare.toggleFailed": "Could not update sharing.",
  "publicShare.nowPublic": "Public link is on.",
  "publicShare.nowPrivate": "Public link is off.",
  "publicShare.loading": "Loading…",
  "publicShare.readOnlyBadge": "Public view (read-only)",
  "publicShare.publicBadge": "Public",
  "viewerUi.hideAll": "Hide floating UI",
  "viewerUi.showAll": "Show floating UI",
  "viewerUi.viewModeToolbar": "View mode",
  "viewerUi.standardLayout": "Standard — toolbars, dock, and breadcrumbs",
  "viewerUi.focusLayout": "Focus — content only",
};

const zhTW: Record<MessageKey, string> = {
  "common.projects": "專案",
  "common.dashboard": "控制台",
  "common.docs": "文件",
  "common.home": "首頁",
  "common.documents": "文件庫",
  "common.allProjects": "所有專案",
  "common.browseDocs": "瀏覽文件",
  "common.createProject": "建立專案",
  "common.cancel": "取消",
  "common.create": "建立",
  "common.creating": "建立中…",
  "common.raw": "開啟原始 /docs 網址",
  "common.saved": "已儲存",
  "common.saveShortcut": "⌘S / Ctrl+S 儲存",
  "common.unsavedChanges": "有未儲存的變更",
  "common.saving": "儲存中…",
  "common.langEn": "EN",
  "common.langZhTw": "繁中",
  "common.more": "更多",
  "common.teamCalendar": "團隊行事曆",
  "common.profile": "個人資料",
  "common.teamSettings": "團隊管理",
  "mdViewer.view": "檢視",
  "mdViewer.split": "分割",
  "mdViewer.edit": "編輯",
  "mdViewer.layoutAria": "編輯器版面",
  "mdViewer.docCardAria": "文件",
  "mdViewer.saveFailed": "儲存失敗",
  "theme.system": "跟隨系統",
  "theme.light": "淺色",
  "theme.dark": "深色",
  "theme.cycleTitle": "主題：{{label}}。點一下切換：系統 → 淺色 → 深色。",
  "home.title": "專案",
  "home.subtitle":
    "每個專案都有公開首頁、文件網址，以及 {{dash}} 後台可管理上傳。檔案網址類似 {{docExample}}。",
  "home.empty": "尚無專案。請點 {{create}} 建立第一個。",
  "home.dashboard": "控制台",
  "createProject.cta": "建立專案",
  "createProject.title": "新專案",
  "createProject.subtitle":
    "請輸入顯示名稱，網址會依此產生 slug（例如 {{example}}）。",
  "createProject.nameLabel": "專案名稱",
  "createProject.placeholder": "例如：產品路線圖",
  "createProject.error": "無法建立專案",
  "projectHome.subtitle":
    "在控制台上傳 {{html}} 或 {{tsx}} 可在此顯示整頁網站，或將文件發布在 {{docs}}。",
  "projectHome.openDashboard": "開啟控制台",
  "projectHome.docs": "文件",
  "projectHome.iframeTitle": "自訂專案首頁",
  "dash.title": "控制台",
  "dash.subtitleIntro": "管理 {{name}} 的公開首頁與文件。",
  "dash.publicHomeLabel": "公開首頁：",
  "dash.tabHome": "首頁檔案",
  "dash.tabDocs": "文件",
  "dash.tabAi": "AI",
  "dash.aiSectionTitle": "專案 AI",
  "dash.aiSectionDesc":
    "聊天使用 OpenRouter。搜尋與工具涵蓋此專案的文件與公開首頁（HTML／TSX）。請建立索引以啟用語意搜尋。",
  "dash.aiIndexStatus": "搜尋索引：{{count}} 個片段 · {{time}}",
  "dash.aiIndexEmpty": "尚未建立搜尋索引 — 請重建以啟用語意搜尋。",
  "dash.aiIndexLoading": "載入索引狀態…",
  "dash.aiRebuildIndex": "重建搜尋索引",
  "dash.aiNewChat": "新對話",
  "dash.aiNewChatFailed": "無法開始新對話",
  "dash.aiIndexing": "索引中…",
  "dash.aiIndexFailed": "無法重建索引",
  "dash.aiHint":
    "助理可管理此專案的文件與公開首頁（custom.html／custom.tsx）。",
  "dash.aiEmpty": "可詢問文件或首頁，或請求編輯。",
  "dash.aiRoleUser": "您",
  "dash.aiRoleAssistant": "助理",
  "dash.aiCopyYourMessage": "複製您的訊息",
  "dash.aiThinking": "思考中…",
  "dash.aiPlaceholder": "傳訊息給專案助理…",
  "dash.aiSend": "送出",
  "dash.aiError": "請求失敗",
  "dash.aiToolTrace": "工具紀錄",
  "dash.aiStop": "停止",
  "dash.aiRateLimited": "請求過於頻繁，請於 {{sec}} 秒後再試。",
  "dash.aiPhaseThinking": "思考中…",
  "dash.aiPhaseReadingFile": "讀取 {{path}}",
  "dash.aiPhaseReadingHome": "讀取 {{file}}",
  "dash.aiPhaseListingDocs": "列出文件…",
  "dash.aiPhaseListingHome": "列出首頁檔案…",
  "dash.aiPhaseWritingFile": "寫入 {{path}}",
  "dash.aiPhaseDeletingFile": "刪除 {{path}}",
  "dash.aiPhaseRenamingFile": "重新命名 {{from}} → {{to}}",
  "dash.aiPhaseSearching": "搜尋中…",
  "dash.aiPhaseGrepping": "在檔案中搜尋…",
  "dash.aiPhaseWritingHome": "寫入 {{file}}",
  "dash.aiPhaseTool": "{{tool}}",
  "ai.fabTitle": "開啟專案 AI 助理",
  "ai.panelTitle": "{{name}}",
  "ai.panelSubtitle": "專案助理 · 文件與首頁",
  "ai.panelDescription": "與專案助理對話，工具僅影響此專案的文件與首頁檔案。",
  "ai.closePanel": "關閉聊天",
  "dash.homeFilesTitle": "首頁檔案",
  "dash.homeFilesDesc":
    "可上傳 HTML（沙箱 iframe 全頁預覽）或 TSX（在專案首頁網址即時預覽）。若有檔案，首頁路由會整頁替換為該內容。",
  "dash.customOnDisk": "磁碟上已有 {{file}} — 請開啟",
  "dash.customOnDiskLink": "公開首頁",
  "dash.customOnDiskSuffix": "檢視。",
  "dash.docsSectionTitle": "文件",
  "dash.docsSectionDesc": "檔案網址為 {{path}}。",
  "dash.deleteSectionTitle": "刪除專案",
  "dash.deleteSectionDesc": "從磁碟移除此專案，包含所有文件與首頁上傳。此動作無法復原。",
  "dash.deleteProject": "刪除專案",
  "dash.deleteProjectConfirm":
    "要刪除「{{name}}」（/{{slug}}）及其所有檔案嗎？此動作無法復原。",
  "dash.deletingProject": "刪除中…",
  "dash.deleteProjectFailed": "無法刪除專案",
  "docsPage.title": "文件庫",
  "docsPage.subtitleLead": "瀏覽各專案檔案。每個圖磚會開啟公開文件連結。新增或刪除檔案請到各專案的",
  "docsPage.subtitleTrail": "。",
  "docsPage.filterBanner": "顯示專案「{{name}}」的文件",
  "docsPage.showAll": "顯示所有專案",
  "explorer.noMatch": "沒有符合篩選的專案，或該專案尚無檔案。",
  "explorer.noProjects": "尚無專案。請先在首頁建立專案，再在控制台新增檔案。",
  "explorer.manageDashboard": "在控制台管理",
  "explorer.noDocs": "此專案尚無文件。",
  "kind.markdown": "Markdown",
  "kind.pdf": "PDF",
  "kind.image": "圖片",
  "kind.html": "HTML",
  "kind.code": "程式碼",
  "kind.other": "其他",
  "upload.replaceTitle": "取代首頁",
  "upload.replaceDesc":
    "上傳 HTML 以沙箱 iframe 預覽，或上傳 TSX/JSX 在瀏覽器內即時預覽（react-live：僅 React + lucide-react；不在伺服器執行）。",
  "upload.choose": "選擇 .html 或 .tsx 檔",
  "upload.uploading": "上傳中…",
  "upload.failed": "上傳失敗",
  "upload.savedAs": "已儲存為 {{name}}。",
  "docPage.embedNote": "（下方嵌入該網址）",
  "docViewer.pdfHint":
    "預覽來自公開文件網址（同源）。若開發者工具出現連到其他主機或埠（例如舊的本地開發網址）的失敗請求，多半是 PDF 內嵌連結註解造成，而非此應用程式。",
  "docViewer.htmlHint": "上傳 HTML 的沙箱預覽。",
  "docViewer.mdHint": "Markdown 應在編輯器工作區開啟。",
  "docViewer.codeHint": "沙箱 iframe 文字預覽。下載請用 Raw。",
  "docViewer.otherHint": "此檔案類型沒有內建預覽。請開啟原始網址或下載。",
  "docViewer.openFile": "開啟檔案",
  "docsWs.pasteTitle": "貼上 Markdown",
  "docsWs.pathLabel": "檔案路徑（於 docs 下）",
  "docsWs.pathPlaceholder": "summary.md 或 notes/q1.md",
  "docsWs.contentLabel": "內容",
  "docsWs.saveMd": "儲存 Markdown",
  "docsWs.saving": "儲存中…",
  "docsWs.uploadTitle": "上傳檔案",
  "docsWs.uploadDesc": "PDF、圖片或其他素材。檔名會保留在 {{path}} 之下",
  "docsWs.chooseFile": "選擇檔案",
  "docsWs.working": "處理中…",
  "docsWs.reloadList": "從磁碟重新載入清單",
  "docsWs.publishedTitle": "已發布路徑",
  "docsWs.publishedHelp":
    "檔名保留 Unicode。點標題開啟：Markdown 用分割編輯器與即時預覽，其他類型用內建檢視器（麵包屑＋導覽）。在 {{docs}} 網址後加 {{raw}} 可取得純文字。用「{{edit}}」在 {{docsFolder}} 下移動或重新命名。",
  "docsWs.noFiles": "尚無檔案 — 請上傳或貼上 Markdown。",
  "docsWs.pathUnderDocs": "docs 下的路徑",
  "docsWs.save": "儲存",
  "docsWs.rawMd": "原始 .md",
  "docsWs.editPath": "編輯路徑",
  "docsWs.delete": "刪除",
  "docsWs.openMd": "在 Markdown 編輯器開啟",
  "docsWs.openViewer": "在檢視器開啟",
  "docsWs.uploadFailed": "上傳失敗",
  "docsWs.saveFailed": "儲存失敗",
  "docsWs.deleteFailed": "刪除失敗",
  "docsWs.renameFailed": "重新命名失敗",
  "docsWs.pathEmpty": "路徑不可為空",
  "docsWs.confirmDelete": "要從此專案刪除「{{path}}」嗎？此動作無法復原。",
  "docsWs.statusUploaded": "已上傳 {{path}}。",
  "docsWs.statusDeleted": "已刪除 {{path}}。",
  "docsWs.statusRenamed": "已重新命名為 {{path}}。",
  "docsWs.statusSavedMd": "已儲存 {{path}}。",
  "login.title": "登入",
  "login.subtitle": "管理員以信箱驗證碼登入；成員經核准後以存取金鑰登入。",
  "login.emailLabel": "電子郵件",
  "login.emailPlaceholder": "you@example.com",
  "login.sendCode": "寄送驗證碼",
  "login.sending": "寄送中…",
  "login.codeLabel": "6 位數驗證碼",
  "login.codePlaceholder": "000000",
  "login.verify": "驗證並繼續",
  "login.verifying": "驗證中…",
  "login.sentHint": "請查看 {{email}} 的信件。",
  "login.genericError": "發生錯誤，請再試一次。",
  "login.rateLimited": "請等待 {{sec}} 秒後再索取驗證碼。",
  "login.backToEmail": "改用其他信箱",
  "login.notConfigured": "此部署尚未設定登入（缺少伺服器環境變數）。",
  "login.devChecklist": "本機開發：請在 `.env.local` 修正以下項目後重新執行 `npm run dev`：",
  "login.backHome": "返回專案列表",
  "login.resendHintTesting":
    "Resend 測試寄件者（例如 onboarding@resend.dev）通常只能把 OTP 寄到你 Resend 帳號所驗證的信箱。若要讓其他允許名單上的地址收信：請在 Resend 驗證你的網域、把 RESEND_FROM 設為該網域下的地址，然後再試一次。",
  "login.resendHintFrom":
    "寄件者地址未被 Resend 接受。請在 Resend 後台驗證網域後，使用該網域下的地址作為 RESEND_FROM。",
  "login.resendHintUnknown":
    "郵件服務拒絕寄出。請檢查伺服器紀錄、RESEND_API_KEY 與 RESEND_FROM；使用已驗證網域後，即可寄到允許名單上的任何地址。",
  "login.subtitleUsername": "使用使用者名稱建立帳號，或以既有名稱登入。",
  "login.usernameLabel": "使用者名稱",
  "login.usernamePlaceholder": "例如 alex_team",
  "login.tabRegister": "建立帳號",
  "login.tabLogin": "登入",
  "login.submitRegister": "建立並登入",
  "login.submitLogin": "登入",
  "login.openModeTitle": "未啟用登入",
  "login.openModeIntro":
    "目前任何人皆可使用此站台。請設定至少 16 字元的 AUTH_SECRET 以啟用僅使用者名稱帳號，或設定 AUTH_ALLOWED_EMAILS 與 Resend 以啟用信箱驗證碼登入。",
  "login.hintsHeading": "登入方式說明",
  "teamCal.title": "團隊行事曆",
  "teamCal.subtitle":
    "點日期可開啟當日行程區塊列表，再點區塊檢視或編輯。管理員可於該畫面或週／日檢視的時段新增。",
  "teamCal.backProjects": "專案列表",
  "teamCal.loading": "載入中…",
  "teamCal.loadFailed": "無法載入行事曆。",
  "teamCal.noEvents": "尚無行程。",
  "teamCal.eventTitle": "標題",
  "teamCal.start": "開始",
  "teamCal.end": "結束",
  "teamCal.notes": "備註",
  "teamCal.assign": "指派成員",
  "teamCal.save": "儲存活動",
  "teamCal.saving": "儲存中…",
  "teamCal.delete": "刪除",
  "teamCal.newEvent": "新增活動",
  "teamCal.editEvent": "編輯活動",
  "teamCal.eventsHeading": "行程",
  "teamCal.adminBadge": "管理員",
  "teamCal.memberBadge": "成員",
  "teamCal.createReservedUser": "建立使用者（僅管理員可用的名稱）",
  "teamCal.createUserBtn": "建立使用者",
  "teamCal.today": "今天",
  "teamCal.prev": "上一段",
  "teamCal.next": "下一段",
  "teamCal.viewMonth": "月",
  "teamCal.viewWeek": "週",
  "teamCal.viewDay": "日",
  "teamCal.viewAgenda": "列表",
  "teamCal.agendaToolbar": "列表 · 自選日起八週內",
  "teamCal.more": "更多",
  "teamCal.noEventsInRange": "此區間沒有行程。",
  "teamCal.newEventSlot": "在此時段建立活動",
  "teamCal.validationTitleTime": "請填標題與有效的開始／結束時間。",
  "teamCal.userCreatedOk": "已建立使用者。",
  "teamCal.newEventCta": "建立",
  "teamCal.openDaySheetAria": "開啟當日行程",
  "teamCal.daySheetHint": "點區塊可檢視或編輯詳情。",
  "teamCal.daySheetEmpty": "這天尚無行程。",
  "teamCal.clickDayForSchedule": "開啟當日完整列表",
  "teamCal.wd.mon": "一",
  "teamCal.wd.tue": "二",
  "teamCal.wd.wed": "三",
  "teamCal.wd.thu": "四",
  "teamCal.wd.fri": "五",
  "teamCal.wd.sat": "六",
  "teamCal.wd.sun": "日",
  "teamCal.teamAdmin": "團隊管理",
  "teamAdmin.title": "團隊管理",
  "teamAdmin.subtitle": "管理成員、存取金鑰，以及邀請／兌換碼。",
  "teamAdmin.backCalendar": "行事曆",
  "teamAdmin.usersHeading": "使用者",
  "teamAdmin.keysHeading": "邀請與兌換金鑰",
  "teamAdmin.createUserLabel": "新使用者名稱",
  "teamAdmin.createUserBtn": "建立使用者",
  "teamAdmin.roleMember": "成員",
  "teamAdmin.roleViewer": "檢視者（僅文件）",
  "teamAdmin.saveRole": "儲存角色",
  "teamAdmin.accessKeyBtn": "設定管理員存取金鑰",
  "teamAdmin.accessKeyHint":
    "擁有此金鑰的維運人員可在登入頁以「使用者名稱＋金鑰」登入該帳號。請在顯示時複製；伺服器不會保存明文。",
  "teamAdmin.accessKeyRevealed": "新的管理員存取金鑰（請立即複製）",
  "teamAdmin.clearAccessKey": "清除管理員存取金鑰",
  "teamAdmin.keyKindInvite": "邀請（新使用者名稱）",
  "teamAdmin.keyKindRedeem": "兌換（檢視者升為成員）",
  "teamAdmin.createKeyBtn": "產生金鑰",
  "teamAdmin.keyLabel": "標籤",
  "teamAdmin.expiresOptional": "到期（選填，本地日期時間）",
  "teamAdmin.maxUsesOptional": "最多使用次數（選填，空白＝不限）",
  "teamAdmin.secretOnce": "密鑰（僅顯示一次，請立即複製）",
  "teamAdmin.copySecret": "複製金鑰",
  "teamAdmin.copiedSecret": "已複製金鑰。",
  "teamAdmin.deleteKey": "撤銷",
  "teamAdmin.impersonateHeading": "以管理員存取金鑰登入",
  "teamAdmin.impersonateBtn": "前往登入頁此流程",
  "teamAdmin.redeemKeyHeading": "登入後兌換金鑰",
  "teamAdmin.redeemKeyBtn": "套用兌換金鑰",
  "teamAdmin.memberStatusPending": "待審核",
  "teamAdmin.memberStatusApproved": "已核准",
  "teamAdmin.hasLoginKey": "已有存取金鑰",
  "teamAdmin.approveUserBtn": "核准並發放金鑰",
  "teamAdmin.newMemberAccessKeyBtn": "重新發放存取金鑰",
  "teamAdmin.memberLoginKeyHint":
    "核准申請或在此建立使用者後，請立即複製顯示一次的成員存取金鑰——對方只用該金鑰在登入頁登入。",
  "profile.title": "個人資料",
  "profile.subtitle": "行事曆色調、頭像顯示文字與團隊代稱。",
  "profile.hue": "行事曆色相（0–360）",
  "profile.avatar": "頭像（表情符號或短文字，顯示於行事曆）",
  "profile.backupKey": "備援登入金鑰",
  "profile.backupHint":
    "可自訂密鑰，或按「產生備援金鑰」取得隨機字串。儲存或產生後，可用「團隊使用者名稱或此信箱＋備援金鑰」登入（不需 OTP）。若要清除，留空後按儲存。",
  "profile.generateBackupKeyBtn": "產生隨機備援金鑰",
  "profile.generateBackupKeyDone": "已建立新的備援金鑰——請複製下方醒目區塊內的金鑰。",
  "profile.generatedBackupWarn": "請將此金鑰保存在安全處，之後不會再顯示。",
  "profile.copyGeneratedBackup": "複製金鑰",
  "profile.copiedGeneratedBackup": "已複製金鑰。",
  "profile.dismissGeneratedBackup": "關閉",
  "profile.save": "儲存",
  "profile.teamUsername": "團隊使用者名稱",
  "profile.teamUsernameHelp":
    "行事曆與備援登入都使用此帳號代稱（以信箱建立帳號時會自動產生）。若你平常用信箱 OTP 登入，請複製此名稱以便之後用備援登入。",
  "profile.copyUsername": "複製",
  "profile.copiedUsername": "已複製。",
  "profile.emailModeKeyHint": "成員存取金鑰由管理員在核准或建立帳號時發放；請在登入頁以該金鑰登入。",
  "login.backupKeyOptional": "備援金鑰（僅在個人資料已設定過時才填）",
  "login.emailOtpBackupHint":
    "名單內管理員使用信箱 OTP。其他人先申請使用者名稱，待管理員核准後，使用管理員給的存取金鑰登入。",
  "login.adminOtpHeading": "管理員 — 信箱驗證碼",
  "login.memberKeyHeading": "團隊成員 — 存取金鑰",
  "login.memberKeyBody":
    "貼上管理員在你通過審核後（或建立帳號後）給你的完整金鑰。不需填使用者名稱欄位，金鑰本身即可辨識身分。",
  "login.memberKeyPlaceholder": "存取金鑰",
  "login.memberKeySubmit": "以金鑰登入",
  "login.registerRequestHeading": "申請加入團隊",
  "login.registerRequestBody": "選擇不重複的團隊使用者名稱。名單內管理員會在團隊管理頁看到你的申請並可核准。",
  "login.registerRequestSubmit": "送出申請",
  "login.registerRequestOk": "已收到申請。請等待管理員核准並提供存取金鑰後再登入。",
  "login.adminAccessEmailHint":
    "維運用：若該使用者在團隊管理頁設定了「管理員存取金鑰」，可在此以使用者名稱／信箱＋該金鑰代為登入（與成員存取金鑰不同）。",
  "login.backupFlowTitle": "備援登入（不收驗證碼）",
  "login.backupFlowBody": "請填在個人資料看到的信箱或團隊使用者名稱，以及你在該頁儲存的備援金鑰。",
  "login.backupIdentifierPlaceholder": "信箱或團隊使用者名稱",
  "login.backupSubmit": "以備援金鑰登入",
  "login.inviteHeading": "兌換邀請",
  "login.inviteUsername": "使用者名稱",
  "login.inviteKey": "邀請金鑰",
  "login.inviteSubmit": "建立並登入",
  "login.adminAccessHeading": "管理員存取（使用者名稱＋帳號金鑰）",
  "login.adminAccessUser": "團隊使用者名稱或帳號信箱",
  "login.adminAccessKey": "管理員存取金鑰",
  "login.adminAccessSubmit": "以此帳號登入",
  "auth.logout": "登出",
  "publicShare.shareButton": "分享",
  "publicShare.dialogTitle": "公開連結",
  "publicShare.dialogDescription": "擁有連結者無需登入即可檢視此頁面。你可隨時關閉公開。",
  "publicShare.enableHint": "目前未公開。開啟後可取得可複製的公開網址。",
  "publicShare.enableButton": "開啟公開連結",
  "publicShare.revokeButton": "關閉公開連結",
  "publicShare.closeButton": "關閉",
  "publicShare.copyLink": "複製公開連結",
  "publicShare.copied": "已複製連結。",
  "publicShare.copyFailed": "無法複製。",
  "publicShare.toggleFailed": "無法更新分享設定。",
  "publicShare.nowPublic": "已開啟公開連結。",
  "publicShare.nowPrivate": "已關閉公開連結。",
  "publicShare.loading": "載入中…",
  "publicShare.readOnlyBadge": "公開檢視（唯讀）",
  "publicShare.publicBadge": "公開",
  "viewerUi.hideAll": "隱藏浮動介面",
  "viewerUi.showAll": "顯示浮動介面",
  "viewerUi.viewModeToolbar": "檢視模式",
  "viewerUi.standardLayout": "標準 — 工具列、快捷列與麵包屑",
  "viewerUi.focusLayout": "專注 — 僅內容",
};

export const messages: Record<AppLocale, Record<MessageKey, string>> = {
  en,
  "zh-TW": zhTW,
};

export function translate(
  locale: AppLocale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  let out = messages[locale][key] ?? messages.en[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replaceAll(`{{${k}}}`, String(v));
    }
  }
  return out;
}
