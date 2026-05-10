For Java, you usually publish to:

- Maven Central
- usable by:
  - Maven
  - Gradle

Modern easiest way is:

```txt id="n4k7q2"
GitHub + Maven Central (Sonatype)
```

---

# 1. Create package structure

```txt id="m1v8p5"
java/
├── src/main/java/com/pingbus/sdk/
├── build.gradle
├── settings.gradle
└── gradle.properties
```

OR Maven equivalent.

---

# 2. Create Maven Central account

Go to:

[Central Portal](https://central.sonatype.com?utm_source=chatgpt.com)

Login with GitHub.

---

# 3. Verify namespace

You need namespace ownership like:

```txt id="r8m2k6"
io.github.yourusername
```

Example:

```txt id="p3v9n1"
io.github.pingbus
```

If you own a domain:

```txt id="c7x4q5"
com.pingbus
```

is even better.

---

# 4. Example Gradle config

`build.gradle`

```gradle id="t6n1m8"
plugins {
    id 'java'
    id 'maven-publish'
    id 'signing'
}

group = 'io.github.pingbus'
version = '0.1.0'

publishing {
    publications {
        mavenJava(MavenPublication) {
            from components.java

            pom {
                name = 'PingBus SDK'
                description = 'PingBus Java SDK'
                url = 'https://github.com/pingbus/sdk-java'

                licenses {
                    license {
                        name = 'MIT'
                        url = 'https://opensource.org/licenses/MIT'
                    }
                }

                developers {
                    developer {
                        id = 'pingbus'
                        name = 'PingBus'
                    }
                }

                scm {
                    connection = 'scm:git:git://github.com/pingbus/sdk-java.git'
                    developerConnection = 'scm:git:ssh://github.com/pingbus/sdk-java.git'
                    url = 'https://github.com/pingbus/sdk-java'
                }
            }
        }
    }
}
```

---

# 5. Generate GPG key

Required by Maven Central.

Install:

[GnuPG](https://gnupg.org/download/?utm_source=chatgpt.com)

Generate key:

```bash id="x9k2p4"
gpg --full-generate-key
```

List keys:

```bash id="q5m7v1"
gpg --list-secret-keys --keyid-format LONG
```

Export:

```bash id="b3n8r6"
gpg --armor --export-secret-keys YOUR_KEY_ID
```

---

# 6. Configure Gradle properties

`~/.gradle/gradle.properties`

```properties id="u7v1k5"
mavenCentralUsername=YOUR_USERNAME
mavenCentralPassword=YOUR_PASSWORD

signing.keyId=YOUR_KEY_ID
signing.password=YOUR_GPG_PASSWORD
signing.secretKeyRingFile=C:\\Users\\YOUR_USER\\.gnupg\\secring.gpg
```

---

# 7. Publish

```bash id="d2m9q4"
gradle publish
```

OR:

```bash id="w8p3n7"
./gradlew publish
```

---

# 8. Users can install with Maven

```xml id="f4x1k8"
<dependency>
    <groupId>io.github.pingbus</groupId>
    <artifactId>sdk</artifactId>
    <version>0.1.0</version>
</dependency>
```

---

# 9. Or Gradle

```gradle id="l6q2v9"
implementation 'io.github.pingbus:sdk:0.1.0'
```

---

# Easier Alternative (Recommended Initially)

Publish to:

[GitHub Packages](https://github.com/features/packages?utm_source=chatgpt.com)

instead of Maven Central.

Way easier:

- no Sonatype review
- no namespace verification
- simpler auth.

Your structure is not yet in proper Maven layout.

You should restructure it like this:

```txt id="w3m8k1"
java/
├── pom.xml
├── README.md
└── src/
    └── main/
        └── java/
            └── com/
                └── pingbus/
                    ├── PingBusClient.java
                    └── Models.java
```

Move:

- `PingBusClient.java`
- `Models.java`

into:

```txt id="f7q2n5"
src/main/java/com/pingbus/
```

---

Also add package declaration at top of files:

```java id="m4v9x2"
package com.pingbus;
```

Example:

```java id="a8k1p6"
package com.pingbus;

public class PingBusClient {
}
```

---

Then your `pom.xml` can look like:

```xml id="r2n7m4"
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>io.github.pingbus</groupId>
    <artifactId>pingbus-sdk</artifactId>
    <version>0.1.0</version>

    <name>PingBus SDK</name>
    <description>Official Java SDK for PingBus</description>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>

</project>
```

---

Then test locally:

```bash id="t5p8q1"
mvn clean package
```

It should generate:

```txt id="u1k4m7"
target/pingbus-sdk-0.1.0.jar
```

---

To publish later:

- Maven Central
  OR
- GitHub Packages.

For now first ensure:

- structure correct
- JAR builds successfully.

---

Users will then use:

## Maven

```xml id="p6x3n9"
<dependency>
    <groupId>io.github.pingbus</groupId>
    <artifactId>pingbus-sdk</artifactId>
    <version>0.1.0</version>
</dependency>
```

## Gradle

```gradle id="c9v2m5"
implementation 'io.github.pingbus:pingbus-sdk:0.1.0'
```

You uploaded a raw JAR manually, but Maven Central expects a proper Maven artifact structure with generated metadata.

The error:

```txt id="r8m1k5"
Bundle has content that does NOT have a .pom file
```

means:
your JAR was not built/published through Maven packaging correctly.

---

You should NOT manually zip Java classes and upload.

Instead:

# Correct Flow

Use Maven to generate:

- `.jar`
- `.pom`
- metadata
- sources jar
- javadocs jar

automatically.

---

# Fix Your Project

## 1. Proper folder structure

```txt id="x4v9p2"
java/
├── pom.xml
└── src/
    └── main/
        └── java/
            └── com/
                └── pingbus/
                    ├── PingBusClient.java
                    └── Models.java
```

---

## 2. Add package declarations

At top of BOTH files:

```java id="c7m2q8"
package com.pingbus;
```

---

## 3. Proper `pom.xml`

Use this minimal valid config:

```xml id="u1n8v4"
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>io.github.YOUR_GITHUB_USERNAME</groupId>
    <artifactId>pingbus-java</artifactId>
    <version>0.1.0</version>

    <name>PingBus Java SDK</name>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>

</project>
```

---

# 4. Build correctly

Run:

```bash id="v5k1p9"
mvn clean package
```

This generates:

```txt id="m2q8x6"
target/pingbus-java-0.1.0.jar
```

WITH Maven metadata inside.

---

# 5. Upload THAT generated artifact

NOT manually-created jars.

---

# Strong Recommendation

Do NOT manually upload through UI.

Instead use:

```bash id="n7v3m1"
mvn deploy
```

later after configuring credentials.

That is the real Maven Central workflow.

---

Right now your uploaded JAR lacks:

- proper Maven coordinates
- pom metadata
- packaging metadata

because it wasn't built from Maven structure correctly.

Recommended Next Step

Add this to pom.xml:

<distributionManagement>
    <repository>
        <id>central</id>
        <url>https://central.sonatype.com/api/v1/publisher</url>
    </repository>
</distributionManagement>

Then configure credentials in:

~/.m2/settings.xml

Example:

<settings>
  <servers>
    <server>
      <id>central</id>
      <username>YOUR_USERNAME</username>
      <password>YOUR_TOKEN</password>
    </server>
  </servers>
</settings>

Then simply:

mvn deploy


This means Maven generated/uploaded the JARs, but the `.pom` artifact itself was not included/generated correctly during deploy.

Usually this happens because:

* packaging not defined properly
* deploy plugin misconfigured
* using wrong Sonatype URL
* missing proper publishing plugin

---

# Easiest Modern Fix (Recommended)

Use the official Central Publishing plugin.

Add this to your `pom.xml` inside `<project>`:

```xml id="q7m2v5"
<build>
    <plugins>

        <plugin>
            <groupId>org.sonatype.central</groupId>
            <artifactId>central-publishing-maven-plugin</artifactId>
            <version>0.6.0</version>
            <extensions>true</extensions>

            <configuration>
                <publishingServerId>central</publishingServerId>
                <autoPublish>true</autoPublish>
            </configuration>
        </plugin>

        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-source-plugin</artifactId>
            <version>3.3.1</version>
            <executions>
                <execution>
                    <id>attach-sources</id>
                    <goals>
                        <goal>jar</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>

        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-javadoc-plugin</artifactId>
            <version>3.6.3</version>
            <executions>
                <execution>
                    <id>attach-javadocs</id>
                    <goals>
                        <goal>jar</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>

    </plugins>
</build>
```

---

# Then REMOVE old distributionManagement

Delete this if present:

```xml id="x4p8n1"
<distributionManagement>
...
</distributionManagement>
```

because Central Portal uses the new publishing plugin now.

---

# Then create `settings.xml`

Location:

```txt id="n5k2m7"
C:\Users\YOUR_USER\.m2\settings.xml
```

Contents:

```xml id="u1q9v4"
<settings>
  <servers>
    <server>
      <id>central</id>
      <username>YOUR_CENTRAL_USERNAME</username>
      <password>YOUR_CENTRAL_TOKEN</password>
    </server>
  </servers>
</settings>
```

---

# Generate Token

Go to:

[Central Portal Account Tokens](https://central.sonatype.com/account?utm_source=chatgpt.com)

Generate User Token.

Use:

* token username
* token password

NOT your login password.

---

# Then publish

```bash id="c6m3x8"
mvn clean deploy
```

This is the modern Maven Central workflow and should correctly upload:

* pom
* jar
* sources
* javadocs
* metadata automatically.
