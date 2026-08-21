import pandas as pd
df = pd.read_csv("C:/Users/Harshada Tekale/Downloads/student_dataset_25.csv")
print(df)

missing_data = df.isnull().sum()
print(missing_data)


# # Read CSV file
# df = pd.read_csv("C:/Users/Harshada Tekale/Downloads/student_dataset_25.csv")

# Count duplicate rows
print("Number of duplicates:", df.duplicated().sum())

# Display duplicate rows
print("\nDuplicate rows:")
print(df[df.duplicated()])

# Remove duplicate rows
df2 = df.drop_duplicates()

# Display DataFrame after removing duplicates
print("\nAfter removing duplicates:")
print(df2)

# Save cleaned data
df2.to_csv("C:/Users/Harshada Tekale/Downloads/student_dataset_25.csv", index=False)

