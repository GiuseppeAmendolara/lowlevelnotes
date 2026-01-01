# The `IDisposable` interface
`IDisposable` is an interface that allows you to `release unmanaged resources` like files, database connections, network sockets, etc., when an object is no longer needed.

The C# Garbage Collector (`GC`) automatically cleans up managed resources (like objects in memory). However, GC does NOT clean up unmanaged resources (like file handles, database connections, sockets, etc.).

IDisposable ensures proper cleanup by providing a Dispose() method. Ideally this avoids any memory leaks of sorts.

## How to implement `IDisposable`
```cs linenums="1"
class MyResource : IDisposable
{
    private bool _disposed = false; // Track if disposed

    public void UseResource()
    {
        if (_disposed) throw new ObjectDisposedException(nameof(MyResource));
        Console.WriteLine("Using resource...");
    }

    public void Dispose()
    {
        if (!_disposed)
        {
            Console.WriteLine("Releasing resource...");
            _disposed = true;
        }
    }
}
```

For a real example take a look at my [dvConnection class (ADO.NET SqlConnection wrapper)](/Programming_Foundations/CSharp/Proficient/IDisposable.cs).

**Using using Statement (Best Practice):**
The using statement automatically calls `Dispose()`, even if an exception occurs. This is safer because we can't forget to call `Dispose()`.
```cs linenums="1"
using (MyResource resource = new MyResource())
{
    resource.UseResource();
}  // Dispose() is called automatically here
```

**Using Dispose() Manually:**
```cs linenums="1"
MyResource resource = new MyResource();
resource.UseResource();
resource.Dispose();  // Manually release the resource
```

## Code Sample
```cs linenums="1"
using DataVista.Database.Interface;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Management;

namespace DataVista.Database
{
    public class dvConnection : IdvConnection, IDisposable
    {
        #region FIELDS
        private bool _disposed = false;
        private SqlConnection? _sqlConnection;

        /// <summary>
        /// Configured using <see cref="ConfigurationManager"/>
        /// </summary>
        private string _connectionString = ConfigurationManager.ConnectionStrings["DbConnectionString"].ConnectionString;
        #endregion

        #region CONSTRUCTOR & DESTRUCTOR
        /// <summary>
        /// Inject your own initialized sqlConnection into this constructor.
        /// </summary>
        /// <param name="sqlConnection"></param>
        /// <exception cref="DataException"></exception>
        public dvConnection(SqlConnection sqlConnection)
        {
            if (_sqlConnection == null)
            {
                _sqlConnection = sqlConnection;
            }
            else
            {
                throw new DataException($"{this} failed to build ConnectionString");
            }
        }

        /// <summary>
        /// Pass a valid connectionString into this constructor.
        /// </summary>
        /// <param name="connectionString"></param>
        public dvConnection(string connectionString)
        {
            if (_sqlConnection == null)
            {
                _sqlConnection = new SqlConnection(connectionString);
            }
        }

        /// <summary>
        /// Destructor required to make the <see cref="dvConnection"/> of type <see cref="IDisposable"./>
        /// </summary>
        ~dvConnection()
        {
            _disposed = true;

            if (_sqlConnection != null)
            {
                _sqlConnection.Dispose();
            }

            Dispose(true);
        }
        #endregion

        #region PROPERTIES
        public string ConnectionString
        {
            get { return _connectionString; }
        }

        /// <summary>
        /// Returns a string that identifies the database client.
        /// Similar behaviour to EnvironmentUserName.
        /// </summary>
        public string WorkstationId
        {
            get
            {
                if (_sqlConnection != null) return _sqlConnection.WorkstationId;
                else return "this.SqlConnection == null";
            }
        }

        public SqlConnection SqlConnection
        {
            get
            {
                if (_sqlConnection != null) return _sqlConnection;
                else return null;
            }
        }

        public ConnectionState ConnectionState
        {
            get
            {
                if (_sqlConnection != null) return _sqlConnection.State;
                else return ConnectionState.Closed;
            }
            set
            {
                if (_sqlConnection != null)
                {
                    if (_sqlConnection.State != value)
                    {
                        if (value == ConnectionState.Open)
                        {
                            _sqlConnection.Open();
                        }
                    }
                    else
                    {
                        if (_sqlConnection.State == ConnectionState.Closed)
                        {
                            _sqlConnection.Close();
                        }
                    }
                }
            }
        }

        /// <summary>
        /// Returns a connection ID of the most recent connection attempt,
        /// regardless of whether the attempt succeeded or failed.
        /// </summary>
        public Guid ConnectionId
        {
            get
            {
                if (_sqlConnection != null) return _sqlConnection.ClientConnectionId;
                else return Guid.Empty;
            }
        }
        #endregion

        #region METHODS
        public void Dispose()
        {
            _disposed = true;
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    if (_sqlConnection != null)
                    {
                        _sqlConnection.Dispose();
                        _sqlConnection = null;
                    }
                }
                _disposed = true;
            }
        }

        public override string ToString()
        {
            string connection = $"Connection is {ConnectionState}.";

            return connection;
        }
        #endregion
    }
}
```
