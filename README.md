# Staging Ground for the Williams Mathematics Department Webpage

This repository provides code for updating and deploying the homepage for the Williams College Mathematics Department.


## Editing content: use the Admin Panel

To make the webpage easier to update and maintain, much of the content is separated from the Javascript code, as plain JSON/Markdown files under `deptpage/data/` and `deptpage/articles/`. You *can* hand-edit those files directly (see the [Content data reference](#content-data-reference) below for the format of each one), but the recommended way to add or change content is the built-in admin panel, which covers every content type below plus image upload and Markdown editing, and handles rebuilding/publishing for you.

There are two places to reach it:

* **Locally**, for drafting or previewing changes before they go live: run `npm install` then `npm run dev` from `deptpage/`, and open `/admin` in the dev server. It's a dev-only route (stripped entirely from the production build) and requires no login on your own machine.
* **Live**, on `jersey.cs.williams.edu`: a persistent copy of the same admin UI runs there as the `ephs` user, gated behind a login (username `webmaster`) and reachable only via SSH tunnel — it isn't exposed to the internet:

  ```
  ssh -L 8043:127.0.0.1:8043 ephs@jersey.cs.williams.edu
  ```

  then visit `http://localhost:8043/login`.

In either case: edits **Save** to the local JSON/Markdown files, but that alone doesn't change what visitors see, since most content is bundled into the JS at build time. Use the **Publish to live site** button to commit, rebuild, and (best-effort) push the change — that's the step that actually makes it live.

A handful of things aren't exposed in the admin forms yet (e.g. a course catalog entry's `icon`) — for those you'll still need to hand-edit the JSON as described below.

## Content data reference

Below, `photo`/`icon` paths are root-relative (e.g. a file at `deptpage/images/misc/photo.png` is referenced as `/images/misc/photo.png`), while `article` paths are relative to the `deptpage` directory (e.g. `articles/ssr.md`).

### Modifying the spotlight photo on the front page:

1. Put a **landscape photo** in the `deptpage/images/misc/` directory.

2. Update the `photo` field of the `spotlight` object in `deptpage/data/frontpage.json` to point to the file. The path should be rooted at the `deptpage` directory, e.g. if the photo is called `photo.png`, then the path would be `/images/misc/photo.png`.

3. Update the `caption` field of the `spotlight` object in `deptpage/data/frontpage.json` with an appropriate caption.

### Adding a person to the About Us page:

1. Put a square photo (most formats are supported, but certainly JPG or PNG will work) of the person in the `deptpage/images/people/` directory.

2. Add a new item to the `people` field of `deptpage/data/people.json`. Here is an example:

```
{
    "id": "Mark Hopkins",
    "photo": "/images/people/mark.jpg",
    "role": "faculty",
    "title": "Assistant Professor",
    "webpage": "https://markandrewhopkins.com/",
    "interests": "Machine learning, machine translation, low-resource natural language processing"  
}
```

The `id` is just the person's name. The `role` should be `faculty`, `staff`, `emeriti`, or `affiliate` (for affiliated faculty from other departments who also teach CS courses). You can omit the `webpage` field or `interests` field if not applicable. All other fields are mandatory. Paths are rooted at the `deptpage` directory, e.g. a photo at `deptpage/images/people/mark.jpg` is written as `/images/people/mark.jpg`.


### Adding a course offering to the Courses page:

1. Add a new item to the `sections` field of `deptpage/data/courses.json`. Here is an example:

```
{
    "id": "f26-csci136-2",
    "course": "CSCI 136",
    "semester": "Fall 2026",
    "sectionNumber": "2",
    "instructors": [
        "James Bern"
    ],
    "lecture": "MWF 10-1050am",
    "webpage": "https://catalog.williams.edu/CSCI/detail/?strm=1253&cn=136&crsid=010803"
}
```

The `id` should be unique (the admin panel generates it automatically as `<semester-code>-<course-code>-<sectionNumber>`, e.g. `f26-csci136-2`, from the fields below it — match that format if adding one by hand). The `course` field should match one of the course ids in the `catalog` field of `deptpage/data/courses.json` (see the next step for how to add new courses). The `instructors` field is a list of the instructors for that section (matched against `id`s in `deptpage/data/people.json`). All fields are mandatory, including the `webpage` field (typically this should be the official course homepage, but if that doesn't exist, then just use the Williams Catalog page for that section).

2. If the course is not yet part of the `catalog` field, then you must add it. Each course in the `catalog` field should have the following form:

```
{
    "id": "CSCI 104",
    "title": "Data Science and Computing for All",
    "icon": "/images/courseicons/icon-cs104.png",
    "description": "Many of the world's greatest discoveries..."
}
```

If there is no icon (Iris made all the original icons), then just create some arbitrary square image, preferably a circular logo with a transparent background, then add it to the `deptpage/images/courseicons` directory. (The `icon` field isn't exposed in the admin panel's course catalog form, so new/changed icons currently need to be set by hand-editing this file.)

### Adding an event to the Colloquium page:

1. Put a **square** photo (any format, but typically JPG or PNG) of the speaker (or some other image representing the event) in the `deptpage/images/colloquium/` directory.

2. Add a new item to the `events` field of `deptpage/data/colloquium.json`. Here is an example:

```
{
    "date": "May 3, 2024",
    "speaker": "Melanie Subbiah",
    "affiliation": "Columbia University",
    "title": "How did we get here? The Rise of Large Language Models and the Problem of Evaluation",
    "location": "Bronfman Auditorium",
    "time": "1pm",
    "photo": "/images/colloquium/subbiah.jpeg",
    "abstract": "Large Language Models (LLMs) have permeated almost every field..."
}
```

The `location` and `time` fields are optional (if not provided, the default values are `TCL 123` and `2:35pm`). All other fields are mandatory. The `date` field needs to be automatically parsed, so make sure there are no typos.

### Adding an article to the News page:

1. Create a Markdown file in the `deptpage/articles/` directory that contains the body of the article (see `deptpage/articles/purdue-data.md` for an example).

2. If the article has an associated photo, then put this photo in the `deptpage/images/misc/` directory.

3. Add a new item to the `articles` field of `deptpage/data/news.json`. Here is an example:

```
    {
        "id": "article-purdue-data",
        "date": "December 5, 2023",
        "title": "Williams CS Majors Place 3rd in Purdue Data 4 Good Competition",
        "photo": "/images/misc/purdue-data.jpg",
        "thumbnail": "/images/misc/purdue-data-thumb.jpg",
        "article": "articles/purdue-data.md",
        "teaser": "Williams CS Majors get third place in a data science competition!"            
    }
```

The `id`s of all articles should be unique. The `teaser` is what shows up when this article is advertised on the main homepage. You can omit the `teaser` if you want to just use the `title` as the `teaser`. The `photo` can also be omitted. All other fields are mandatory.

The `thumbnail` field is optional and should be a **square** photo. When this article is the most recent one, it's used as a small preview image in the "department news" widget on the front page. If omitted, that widget just shows the teaser text, same as before this field existed.


### Modifying information on the Student Life page:

1. To update the board members of the various student organizations, first add a **square** photo of the board member to the `deptpage/images/students` directory. Then add a new item to the `leadership` field of the relevant group in `deptpage/data/students.json`. Here is an example:

```
{
    "name": "Ye Shu",
    "year": "2024",
    "photo": "/images/students/shu.jpeg"
}
```

2. Other information can also be changed by modifying `deptpage/data/students.json`, like the webpage or description of a student group.


### Adding a content block (Front Page, Research Opportunities, Non-Majors, Plan Your Major):

`deptpage/data/frontpage.json`, `research.json`, `nonmajors.json`, and `major.json` all render their body out of a shared `content` array of "blocks", each either a piece of writing or a hardcoded React component:

1. Create a Markdown file in the `deptpage/articles/` directory that contains the block's text (see `deptpage/articles/ssr.md` for an example).

2. If the block has an associated photo, put it in the `deptpage/images/misc/` directory.

3. Add a new item to the `content` field of the relevant data file. Here is an example, from `deptpage/data/research.json`:

```
{
    "title": "Summer Science Research",
    "photo": "/images/misc/kayaking.jpg",
    "article": "articles/ssr.md"
}
```

`title` and `photo` are both optional (`photo` is rendered below the title). `article` is mandatory. Blocks appear on the page in the order they appear in the `content` array.

You'll also see entries shaped like `{"component": "FromTheDepartment"}` or `{"component": "MajorPlanningAssistant"}` mixed into some of these `content` arrays — those are hardcoded React widgets wired up in the corresponding page's code, not something to add or copy by hand.

### Adding pre-approved study away courses to the Plan Your Major page:

1. Add a new item to the `equivalents` field of `deptpage/data/studyaway.json`. Here is an example:

```
{
    "program": "AIT Budapest",
    "course": "Algorithms and Data Structures",
    "cs_equiv": "256",
    "math_equiv": 0
}
```

All fields are mandatory. The `cs_equiv` field should have one of the following values: 

* `"no"` (if the course does not satisfy any CSCI major requirement) 
* `"3xx"` (if the course counts as a CSCI elective but there is no exact correspondent at Williams)
* the Williams CSCI course number (e.g. `"256"` in the above example) that corresponds to the study away course.

The `math_equiv` should be either `1` (if the course satisfies the Math elective requirement of the CS major) or `0` (if not).

### Modifying the Major Planning Assistant on the Plan Your Major page:

1. Each major requirement is specified using the following format under the `requirements` field in `deptpage/data/major.json`:

```
{
    "id": "CSCI 3xx(1)",
    "title": "Computer Science Elective 1",
    "info": "A course chosen from 300- or 400-level courses in Computer Science.",
    "prereqs": [
        "CSCI 136"
    ],
    "error": "All electives have 136 as a prerequisite.",
    "recommended": [
        "CSCI 237",
        "CSCI 256"
    ],
    "warning": "Most electives have either 237 or 256 as a prerequisite."   
}
```

* The `id` field should be a unique identifier for the major requirement and the `title` field is a human-friendly summary of the requirement. Both fields are mandatory.

* The `info` field is a description of the major requirement that will be displayed to the student if they click on that requirement. This field is mandatory.

* The `prereqs` field is a list of the `id`s of the prerequisites. They must exactly match (including case) the `id` field of the prerequisite requirement. The list is treated as a conjunction, i.e. the student must have taken **all** the courses prior to enrolling in the major requirement. If not, then the text in `error` field will be displayed to the student. Both the `prereqs` and `error` fields are optional.

* The `recommended` field is a list of the `id`s of recommended previous courses. It is treated as a disjunction, i.e. the student is recommended to have taken **at least one** of these courses prior to enrolling in the major requirement. If not, then the text in `warning` field will be displayed to the student. Both the `recommended` and `warning` fields are optional.

2. Each of the example paths through the major is specified using the following format under the `paths` field in `deptpage/data/major.json`:

```
{
    "id": "accelerated",
    "icon": "🚀",
    "description": "you want to major in CS and you have prior experience",
    "path": [
        {
            "semester": "0",
            "courses": [
                "CSCI 134"
            ]
        },
        {
            "semester": "1a",
            "courses": [
                "CSCI 136",
                "MATH 200"
            ]
        },
        {
            "semester": "1b",
            "courses": [
                "CSCI 237"
            ]
        },
        {
            "semester": "2a",
            "courses": [
                "CSCI 256",
                "MATH 2xx"
            ]
        },
        {
            "semester": "2b",
            "courses": [
                "CSCI 3xx(1)"
            ]
        },
        {
            "semester": "3a",
            "courses": [
                "CSCI 334/361"
            ]
        },
        {
            "semester": "3b",
            "courses": [
                "CSCI 3xx(2)"
            ]
        },
        {
            "semester": "4a",
            "courses": [
                "CSCI 3xx(3)"
            ]
        },
        {
            "semester": "4b",
            "courses": [
                "CSCI 3xx(4)"
            ]
        }
    ]        
}
```

* The `id` field should be a human-friendly name for the major path.
* The `icon` field should be a single emoji that visually represents the major path.
* The `description` field should be a short description of the major path.
* The `path` field is a list of 9 semesters and the major requirements taken during each of them. Semester 0 is not displayed to the user -- it is used to specify requirements that a student has satisfied prior to coming to Williams. The requirements should be specified using the value of the requirement's `id` field.

All fields are mandatory.

## Development

From the `deptpage/` directory:

* `npm install` — install dependencies.
* `npm run dev` — start the Vite dev server (this is also where the local `/admin` panel lives).
* `npm run lint`
* `npm run build` — production build to `deptpage/dist/`.
* `npm run preview` — locally preview a production build.
* `npm run deploy` — builds the site, then copies the build output over the GitHub Pages files at the repo root (`../index.html`, `../assets`). Interior routes (e.g. `/courses/`) rely on the `404.html` client-redirect trick rather than having their own prerendered directory — the repo root is shared with the live bull/jersey deployment, and a physical directory per route was conflicting with its `.htaccess` rewrite rules. This is what the live admin panel's **Publish to live site** button runs on `jersey.cs.williams.edu`; you shouldn't normally need to run it yourself.
* `npm run build:ephs` — the same build, but under the `/~ephs/` base path. Left over from when the site was served from that userdir subpath; not used now that `cs.williams.edu` serves the site directly from the repo root.

