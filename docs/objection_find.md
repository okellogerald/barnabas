# 🌐 **Objection Find API Query Guide**

## 📌 **Introduction**

Objection Find provides a powerful way to query database records using HTTP query parameters. This guide explores the available query options, filters, special parameters, and best practices for effective querying.

---

## 🔎 **Basic Query Structure**

An Objection Find API query typically looks like this:

```javascript
$http({
  method: 'GET',
  url: '/api/persons',
  params: {
    // Basic filters
    'firstName:eq': 'John',
    'age:gte': 18,
    // Relational filters
    'parent.age:lt': 60,
    'movies.name:like': '%Matrix%',
    // Sorting and pagination
    'orderBy': 'lastName',
    'rangeStart': 0,
    'rangeEnd': 10,
    // Relations to fetch eagerly
    'eager': '[children, parent]'
  }
}).then(function (res) {
  console.log(res.data);
});
```

---

## 📌 **Filter Parameters**

Filter parameters allow you to specify criteria for querying. The format is:

```
<propertyReference>|<propertyReference>|...:<filter>=<value>
```

### 📝 **Supported Filters**

| Filter      | Description                          | Example                   |
| ----------- | ------------------------------------ | ------------------------- |
| `eq`        | Equal to                             | `firstName:eq=John`       |
| `neq`       | Not equal to                         | `lastName:neq=Smith`      |
| `lt`        | Less than                            | `age:lt=30`               |
| `lte`       | Less than or equal to                | `age:lte=30`              |
| `gt`        | Greater than                         | `age:gt=18`               |
| `gte`       | Greater than or equal to             | `age:gte=18`              |
| `like`      | Contains a string (case-sensitive)   | `lastName:like=%son%`     |
| `likeLower` | Contains a string (case-insensitive) | `firstName:likeLower=%j%` |
| `in`        | Matches any value in a list          | `parent.age:in=20,22,24`  |
| `notNull`   | Is not null                          | `email:notNull`           |
| `isNull`    | Is null                              | `middleName:isNull`       |

---

## 🔄 **Relational Filters**

You can filter based on relations by using dot notation:

```javascript
// All persons whose parent is younger than 60
'parent.age:lt': 60,

// All persons who acted in "Inception"
'movies.name:eq': 'Inception',

// All persons with at least one child younger than 10
'children.age:lt': 10
```

| Relation     | Description                   | Example                         |
| ------------ | ----------------------------- | ------------------------------- |
| One-to-One   | Reference parent properties   | `parent.lastName:eq=Smith`      |
| One-to-Many  | Reference children properties | `children.firstName:like=%rad%` |
| Many-to-Many | Reference related movies      | `movies.name:like=%Gump%`       |

---

## 📌 **Special Query Parameters**

| Parameter     | Description                                    | Example                            |
| ------------- | ---------------------------------------------- | ---------------------------------- |
| `eager`       | Eager-load related models                      | `eager=[children, parent.movies]`  |
| `join`        | Join and fetch related models                  | `join=[parent, parent.movies]`     |
| `orderBy`     | Sort the results in ascending order            | `orderBy=firstName`                |
| `orderByDesc` | Sort the results in descending order           | `orderByDesc=lastName`             |
| `rangeStart`  | Start index for pagination                     | `rangeStart=0`                     |
| `rangeEnd`    | End index for pagination                       | `rangeEnd=10`                      |
| `count`       | Return the count of rows matching the criteria | `count=*` or `count=id as countId` |
| `groupBy`     | Group results by specified fields              | `groupBy=firstName,lastName`       |

---

## 🌐 **Advanced Query Examples**

### ➡️ **Find all persons whose first name starts with "J" or "j", acted in "Inception", and have a child younger than 10:**

```javascript
$http({
  method: 'GET',
  url: '/api/persons',
  params: {
    'firstName:likeLower': 'J%',
    'movies.name:eq': 'Inception',
    'children.age:lt': 10
  }
}).then(function (res) {
  console.log(res.data);
});
```

### ➡️ **Fetch only persons with a parent older than 50, order by `lastName`, and include their children and movies:**

```javascript
$http({
  method: 'GET',
  url: '/api/persons',
  params: {
    'parent.age:gt': 50,
    'orderBy': 'lastName',
    'eager': '[children, movies]'
  }
}).then(function (res) {
  console.log(res.data);
});
```

### ➡️ **Get the total count of persons grouped by their `firstName` and `lastName`:**

```javascript
$http({
  method: 'GET',
  url: '/api/persons',
  params: {
    'count': 'id',
    'groupBy': 'firstName,lastName'
  }
}).then(function (res) {
  console.log(res.data);
});
```

---

## 📌 **Best Practices**

1. **Use Eager Loading** (`eager`) to avoid N+1 query problems.
2. **Limit the Range** with `rangeStart` and `rangeEnd` to improve performance.
3. **Use Grouping and Counting** only when necessary to reduce load on the database.
4. **Leverage Relations** to make complex queries cleaner and more readable.
