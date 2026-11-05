# Privacy Policy - Web Marker

Last Updated: October 25, 2026


### 0. Rule 0: Disclaimer on Modified Builds, External Packages & Unofficial Forks:

- **Original Source Integrity:** This privacy policy, safety guarantees, and security features apply strictly and exclusively to the official, unmodified extension binaries and source code distributed directly through this official repository ([hamzabellouch/web-marker-ex](https://github.com/hamzabellouch/web-marker-ex)) and its verified official releases.
- **Zero Liability for Modified / External Builds:** We (the publisher and maintainer) assume **no responsibility or liability whatsoever** for any modified extensions, third-party forks, repackaged `.crx` / `.xpi` / `.zip` archives, unofficial distribution channels, or altered projects not originating directly from this official repository. Any installation or use of modified, tampered, or third-party builds is entirely at your own risk, and the publisher assumes no responsibility for any consequences, damages, security compromises, or data breaches that may occur.


### 1. Executive Summary & Overview:

Web Marker is a lightweight productivity and accessibility browser extension engineered to assist users in selecting, highlighting, annotating, organizing, and exporting web text across any webpage seamlessly. The extension operates with an uncompromising focus on digital privacy, local control, and data sovereignty.

#### Core Privacy Commitment:
Web Marker operates **100% locally on your device**. All highlighted text passages, color configurations, note annotations, and page metadata are processed and stored strictly inside your local browser memory and storage (`chrome.storage.local`). We do **not** collect, store, transmit, log, share, or sell any reading data, highlighted content, browsing history, URLs, IP addresses, or device fingerprints to external servers, cloud databases, analytics providers, or third parties.


### 2. Information Processed On-Device:

To deliver its client-side text highlighting and annotation capabilities, Web Marker processes operations **strictly locally within your browser**:

- **Local Text Selection & DOM Highlighting:** When text is selected on a webpage, the extension calculates text node offsets in volatile memory and wraps the text with lightweight inline HTML elements. No selected text is ever sent outside the local webpage environment.
- **Local Highlights Persistence:** User highlights and notes for each webpage are serialized and saved strictly to your browser's local sandbox storage via `chrome.storage.local`, keyed by the current webpage URL. This data remains exclusively on your device.
- **Immediate In-Memory Buffer Cleanup:** Ephemeral selection coordinates, color picker popover states, and floating dock positions exist solely in volatile browser RAM and are purged when selections change or views close.
- **Local Settings Persistence:** User preferences (such as the default highlight color, active palette, and Direct Pen Mode state) are stored strictly locally via `chrome.storage.local`. These settings never leave your browser.
- **Zero Remote Network Communication:** Web Marker functions completely offline. It initiates zero background network connections, sends no HTTP requests, and downloads no dynamic external scripts or assets during operation.
- **No Browsing Activity Monitoring:** Web Marker does not monitor, record, or track your general browsing history, search queries, or form entries. Content scripts activate solely to manage and restore your personal highlights on webpages you visit.


### 3. Permissions Used & Their Purposes:

Web Marker adheres strictly to the principle of least privilege, requesting only the minimal permissions necessary to deliver local text highlighting:

**A. Storage (`storage`)**
- **Purpose:** Saves your webpage highlights, annotations, and user color preferences locally on your device so they persist across browsing sessions and page reloads.

**B. Active Tab (`activeTab`)**
- **Purpose:** Enables the extension to securely interact with the currently active browser tab when you click the extension popup or trigger highlight commands.

**C. Content Scripts (`<all_urls>`)**
- **Purpose:** Allows the extension to render the floating selection menu, the Direct Pen Mode dock, and the highlight markup on standard webpages you choose to browse.

**D. Browser Specific Settings (Firefox Gecko ID: `web-marker@tkno`)**
- **Purpose:** Required by Mozilla Firefox for add-on identification, sandboxing, and Manifest V3 compliance.


### 4. Safety & Content Handling Policy:

Web Marker strictly complies with modern web extension security, sandbox, and Content Security Policy standards:

- **Strict Local Execution:** All core runtime code (`content.js`, `popup.js`, `service-worker.js`, stylesheets, and icons) is bundled locally within the extension archive. Remote code execution (`eval`, dynamic remote script tags, or external CDN script loading) is strictly forbidden.
- **Zero Data Exfiltration:** The extension possesses no analytics backends, telemetry servers, reporting endpoints, or tracking beacons.
- **Clean & Non-Intrusive DOM Injection:** Highlights and floating toolbars are mounted safely into the webpage DOM using scoped styling classes to avoid conflicting with or altering native page logic, forms, or navigation.


### 5. Data Sharing, Analytics & Advertising:

- **No Data Sharing:** Zero user data, highlighted quotes, notes, or URLs ever leave your computer.
- **No Third-Party Analytics / Telemetry:** Web Marker contains no telemetry SDKs, Google Analytics, Firebase, or tracking beacons.
- **No Advertisements:** Web Marker is entirely ad-free, non-commercial, and contains no affiliate links or monetized trackers.


### 6. Data Retention & Lifecycle:

- **Zero External Data Retention:** Because Web Marker does not operate external servers, no user data or reading history is ever stored or logged externally.
- **Complete Local Removal:** You can clear highlights for any page directly from the extension popup. Furthermore, uninstalling or removing the extension from your browser immediately ceases all script execution, removes the extension from memory, and clears all stored highlights and settings from your browser storage.


### 7. Managing Permissions & User Rights:

You maintain total control over Web Marker. You may review, disable, or remove the extension at any time:

- **Chromium Browsers (Chrome, Edge, Brave, Opera, Vivaldi):** Navigate to `chrome://extensions/` (or `edge://extensions/`), locate **Web Marker**, and toggle it off or click **Remove**.
- **Mozilla Firefox:** Navigate to `about:addons` > **Extensions**, locate **Web Marker**, and choose **Disable** or **Remove**.


### 8. Contact & Support:

If you have any questions, feedback, or concerns regarding this Privacy Policy or the security of Web Marker, please contact:  
**Email:** hamzabellouchcontact@gmail.com  
**GitHub:** [https://github.com/hamzabellouch/web-marker-ex](https://github.com/hamzabellouch/web-marker-ex)


-------------------------------------------



# سياسة الخصوصية - Web Marker

آخر تحديث: ٢٥ أكتوبر ٢٠٢٦


### ٠. القاعدة رقم ٠: إخلاء المسؤولية عن الإضافات المعدلة والحزم الخارجية والمشاريع المشتقة:

* **سلامة المصدر الأصلي:** تنطبق سياسة الخصوصية، وضمانات الأمان، والميزات المذكورة في هذه الوثيقة حصرياً وصراحةً على الإصدارات الرسمية غير المعدلة من الإضافة والشفرة المصدرية المنشورة مباشرة عبر هذا المستودع الأصلي المعتمد ([hamzabellouch/web-marker-ex](https://github.com/hamzabellouch/web-marker-ex)) وصفحة إصداراته الرسمية فقط.
* **إخلاء المسؤولية التام عن الحزم المشتقة أو المعدلة:** نحن (الناشر والمطور) **لا نتحمل أي مسؤولية أو التزام قانوني من أي نوع** عن أي نسخ معدلة، أو حزم خارجية غير رسمية بصيغ (`.crx` / `.xpi` / `.zip`)، أو مشاريع مشتقة تم التلاعب بها ولم تصدر مباشرة من هذا المستودع. استخدامك لأي نسخ خارجية يكون بالكامل على مسؤوليتك الشخصية دون أي مسؤولية على الناشر عن أي أضرار أو انتهاكات قد تنشأ عن ذلك.


### ١. الملخص التنفيذي ونطاق العمل:

إضافة Web Marker هي أداة رقمية متطورة مصممة لمساعدة المستخدمين والباحثين على تظليل، وتحديد، وتنظيم، وحفظ، وتصدير النصوص على أي صفحة ويب بكل سهولة ومرونة، مع الالتزام التام والصارم بمبادئ حماية الخصوصية وسيادة البيانات الرقمية.

#### التزام الخصوصية الجوهري:
تعمل إضافة Web Marker **محلياً بنسبة ١٠٠٪ على جهاز المستخدم**. يتم تخزين ومعالجة جميع التظليلات، واختيارات الألوان، والملاحظات بالكامل داخل الذاكرة المحلية لمتصفحك عبر واجهة (`chrome.storage.local`). نحن **لا نجمع**، ولا نخزن، ولا ننقل، ولا نشارك، ولا نبيع أي نصوص مظللة، أو ملاحظات، أو سجل تصفح، أو روابط صفحات، أو عناوين IP لأي خوادم خارجية أو قواعد بيانات سحابية أو أطراف ثالثة.


### ٢. البيانات والمعالجة المحلية داخل الجهاز:

لتقديم خدمة التظليل والتدوين محلياً، تقوم الإضافة بالعمليات التالية **حصرياً داخل متصفحك**:

* **تظليل النصوص محلياً في الصفحة:** عند تحديد أي نص، تقوم الإضافة بحساب مواضع النص المحددة وتغليفها بعناصر HTML مدمجة خفيفة داخل بنية الصفحة (DOM). لا يغادر أي نص محدد بيئة الصفحة المحلية إطلاقاً.
* **حفظ التظليلات محلياً عبر Storage:** يتم حفظ التظليلات ومواقعها وملاحظاتها محلياً فقط على جهازك باستخدام واجهة `chrome.storage.local` المفهرسة برابط الصفحة، لتبقى التظليلات محفوظة ومسترجعة تلقائياً عند زيارة الصفحة مجدداً.
* **التخلص الفوري من الذاكرة المؤقتة:** إحداثيات القوائم العائمة، ومواقع شريط الأدوات، وحالات النوافذ المنبثقة لا توجد إلا في الذاكرة العشوائية الحية (RAM) ويتم مسحها فور إغلاق القوائم أو إلغاء التحديد.
* **حفظ الإعدادات محلياً:** يتم تخزين تفضيلات المستخدم (مثل اللون الافتراضي، ونمط القلم المباشر النشط) محلياً فقط ولا تغادر متصفحك إطلاقاً.
* **انعدام الاتصالات الشبكية الخارجية:** تعمل الإضافة دون الحاجة لأي اتصال بالإنترنت، ولا تقوم بإرسال أي طلبات HTTP أو تحميل أكواد خارجية من أي خادم.
* **عدم مراقبة نشاط التصفح:** لا تراقب الإضافة سجل تصفحك أو استعلامات البحث أو البيانات المدخلة في النماذج، بل يقتصر عملها فقط على إدارة واسترجاع التظليلات في الصفحات التي تقوم بزيارتها.


### ٣. الأذونات المستخدمة وأسبابها:

تلتزم الإضافة بمبدأ الحد الأدنى من الأذونات (Principle of Least Privilege):

**أ. التخزين (`storage`)**
* **الغرض:** حفظ تظليلات صفحات الويب وملاحظاتها وخيارات الألوان محلياً على جهازك لضمان بقائها ومزامنتها بين جلسات التصفح.

**ب. التبويب النشط (`activeTab`)**
* **الغرض:** تمكين الإضافة من التفاعل مع الصفحة المفتوحة حالياً بشكل آمن عند فتح نافذة التحكم أو تنفيذ اختصار التظليل.

**ج. نصوص المحتوى (`<all_urls>`)**
* **الغرض:** إتاحة ظهور شريط التظليل العائم ووضع القلم المباشر وإعادة رسم التظليلات السابقة على صفحات الويب التي تتصفحها.

**د. معرف موزيلا فايرفوكس (`web-marker@tkno`)**
* **الغرض:** مطلوب من قبل متصفح فايرفوكس لتعريف الإضافة وضمان توافقها الكامل مع بيئة ومعايير Manifest V3.


### ٤. سياسة الأمان ومحاصرة البيانات:

* **تنفيذ محلي صارم:** جميع ملفات الشفرة المصدرية (`content.js`, `popup.js`, `service-worker.js`) والأنماط والأيقونات مدمجة ومحزمة محلياً داخل الإضافة. يُحظر تماماً أي تنفيذ لأكواد خارجية أو استدعاء عبر `eval` أو تضمين ملفات من شبكات CDN غير موثوقة.
* **انعدام الاتصال الخارجي والتعقب:** لا تمتلك الإضافة أي خوادم تحليلات أو نقاط نهاية لتجميع البيانات (Zero Telemetry).
* **تكامل آمن مع الصفحة:** يتم إدراج أدوات التظليل وشريط الأدوات بطبقات CSS معزولة تمنع تعارض الإضافة مع تصميم الصفحة أو بنيتها الأصلية.


### ٥. مشاركة البيانات والإعلانات:

* **انعدام المشاركة:** لا تخرج أي بيانات أو نصوص مظللة أو روابط مواقع خارج حاسوبك على الإطلاق.
* **انعدام التتبع والتحليلات:** خالية تماماً من أدوات Google Analytics أو حزم التتبع السلوكي أو برمجيات الإحصاء.
* **انعدام الإعلانات:** أداة مجانية، احترافية، ونظيفة تماماً من أي إعلانات أو روابط ترويجية أو إحالات تسويقية.


### ٦. دورة حياة البيانات والحذف:

* **انعدام الاحتفاظ الخارجي بالبيانات:** نظراً لعدم وجود خوادم خارجية، لا يتم تخزين أي بيانات تخصك خارج جهازك نهائياً.
* **الحذف الكامل والفوري:** يمكنك حذف تظليلات أي صفحة أو جميع التظليلات بنقرة واحدة من نافذة الإضافة. كما أن إزالة أو إلغاء تثبيت الإضافة من المتصفح يؤدي فوراً إلى إيقاف تنفيذها ومسح كافة البيانات والتفضيلات المخزنة محلياً.


### ٧. إدارة الأذونات وحقوق المستخدم:

يمكنك تعطيل أو حذف الإضافة في أي وقت عبر إعدادات المتصفح:
* **متصفحات كروم وإيدج وبريف وأوبرا:** اذهب إلى `chrome://extensions/` (أو `edge://extensions/`)، وابحث عن **Web Marker** واختر إزالة (Remove).
* **متصفح فايرفوكس:** اذهب إلى `about:addons` > **Extensions**، وابحث عن **Web Marker** واختر إزالة (Remove).


### ٨. التواصل والدعم:

لأي استفسارات أو بلاغات تخص الخصوصية وأمان الإضافة، يرجى التواصل عبر:  
**البريد الإلكتروني:** hamzabellouchcontact@gmail.com  
**GitHub:** [https://github.com/hamzabellouch/web-marker-ex](https://github.com/hamzabellouch/web-marker-ex)
